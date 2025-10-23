import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import { uploadDocument } from '@/lib/supabase-storage'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const sessionId = formData.get('sessionId') as string

    if (!file || !sessionId) {
      return NextResponse.json(
        { error: 'File and session ID are required' },
        { status: 400 }
      )
    }

    // Verify session exists and is active
    const session = await db.session.findUnique({
      where: { id: sessionId }
    })

    if (!session || !session.isActive || new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${fileExtension}`

    // Upload to Supabase Storage
    const uploadResult = await uploadDocument(file, filename)

    // Create document record in database
    const document = await db.document.create({
      data: {
        id: uuidv4(),
        filename,
        originalName: file.name,
        storagePath: uploadResult.path,
        fileType: file.type,
        fileSize: file.size,
        status: 'uploaded',
        sessionId,
        metadata: JSON.stringify({
          publicUrl: uploadResult.publicUrl,
          size: uploadResult.size
        })
      }
    })

    // Process document asynchronously
    processDocument(document.id, uploadResult.publicUrl).catch(console.error)

    return NextResponse.json({
      document: {
        id: document.id,
        filename: document.filename,
        originalName: document.originalName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt
      }
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

async function processDocument(documentId: string, publicUrl: string) {
  try {
    // Update document status to processing
    await db.document.update({
      where: { id: documentId },
      data: { status: 'processing' }
    })

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // For this demo, we'll simulate text extraction
    // In a real implementation, you would:
    // 1. Download the file from publicUrl
    // 2. Use PDF/DOCX parsing libraries to extract text
    // 3. Process the extracted text
    
    // Simulate extracted text for demo purposes
    const fileContent = "This is a sample document content. In a real implementation, this would be extracted from the uploaded file. The document contains various standards and regulations that can be queried using natural language."

    // Split text into chunks (simplified chunking)
    const chunks = splitTextIntoChunks(fileContent, 500)

    // Create chunks in database
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      await db.chunk.create({
        data: {
          id: uuidv4(),
          text: chunk.text,
          startPosition: chunk.start,
          endPosition: chunk.end,
          documentId
        }
      })
    }

    // Update document status to ready
    await db.document.update({
      where: { id: documentId },
      data: { status: 'ready' }
    })

  } catch (error) {
    console.error('Document processing error:', error)
    await db.document.update({
      where: { id: documentId },
      data: { status: 'error' }
    })
  }
}

function splitTextIntoChunks(text: string, chunkSize: number) {
  const chunks = []
  const sentences = text.split(/[.!?]+/)
  let currentChunk = []
  let currentLength = 0

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    if (sentence) {
      const sentenceLength = sentence.split(' ').length
      
      if (currentLength + sentenceLength > chunkSize && currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.join('. ') + '.',
          start: i - currentChunk.length,
          end: i
        })
        currentChunk = []
        currentLength = 0
      }
      
      currentChunk.push(sentence)
      currentLength += sentenceLength
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({
      text: currentChunk.join('. ') + '.',
      start: sentences.length - currentChunk.length,
      end: sentences.length
    })
  }

  return chunks
}