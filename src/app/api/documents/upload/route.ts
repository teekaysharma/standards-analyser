import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin, uploadFileToStorage, getPublicUrl } from '@/lib/supabase'

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
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('Session')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session || !session.isActive || new Date() > new Date(session.expiresAt)) {
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
    const filePath = `${sessionId}/${filename}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await uploadFileToStorage(file, filePath)

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Get public URL
    const publicUrl = getPublicUrl(filePath)

    // Create document record in database
    const { data: document, error: docError } = await supabaseAdmin
      .from('Document')
      .insert({
        id: uuidv4(),
        sessionId,
        fileName: filename,
        fileType: file.type,
        fileSize: file.size,
        filePath: filePath
      })
      .select()
      .single()

    if (docError) {
      console.error('Document creation error:', docError)
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      )
    }

    // Process document asynchronously
    processDocument(document.id, publicUrl).catch(console.error)

    return NextResponse.json({
      document: {
        id: document.id,
        filename: document.fileName,
        originalName: file.name,
        fileType: document.fileType,
        fileSize: document.fileSize,
        status: 'uploaded',
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
    await supabaseAdmin
      .from('Document')
      .update({ status: 'processing' })
      .eq('id', documentId)

    // Simulate document processing
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
      await supabaseAdmin
        .from('Chunk')
        .insert({
          id: uuidv4(),
          documentId,
          content: chunk.text,
          chunkIndex: i
        })
    }

    // Update document status to ready
    await supabaseAdmin
      .from('Document')
      .update({ status: 'ready' })
      .eq('id', documentId)

  } catch (error) {
    console.error('Document processing error:', error)
    await supabaseAdmin
      .from('Document')
      .update({ status: 'error' })
      .eq('id', documentId)
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