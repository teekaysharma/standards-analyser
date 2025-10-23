import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { documentId, question } = await request.json()

    if (!documentId || !question) {
      return NextResponse.json(
        { error: 'Document ID and question are required' },
        { status: 400 }
      )
    }

    // Get document with related data
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        session: true,
        chunks: true
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Verify session is valid
    if (!document.session.isActive || new Date() > document.session.expiresAt) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Verify document is ready for querying
    if (document.status !== 'ready') {
      return NextResponse.json(
        { error: 'Document is not ready for querying' },
        { status: 400 }
      )
    }

    // Create query record
    const query = await db.query.create({
      data: {
        id: uuidv4(),
        question,
        documentId
      }
    })

    // Process query asynchronously
    processQuery(query.id, document, question).catch(console.error)

    return NextResponse.json({
      query: {
        id: query.id,
        question: query.question,
        answer: query.answer,
        sources: query.sources,
        createdAt: query.createdAt
      }
    })

  } catch (error) {
    console.error('Query processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    )
  }
}

async function processQuery(queryId: string, document: any, question: string) {
  try {
    // Get all chunks for the document
    const chunks = document.chunks
    
    if (chunks.length === 0) {
      await db.query.update({
        where: { id: queryId },
        data: { answer: 'No content available in this document.' }
      })
      return
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Find relevant chunks (simplified - in real implementation, use vector search)
    const relevantChunks = findRelevantChunks(chunks, question)

    // Create context from relevant chunks
    const context = relevantChunks.map((chunk: any) => chunk.text).join('\n\n')

    // Generate answer using AI
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that analyzes standards documents. 
          Use the provided context to answer the user's question accurately and concisely.
          If the context doesn't contain the answer, say so clearly.
          Always cite the relevant parts of the document that support your answer.`
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuestion: ${question}`
        }
      ]
    })

    const answer = completion.choices[0]?.message?.content || 'No answer generated.'

    // Prepare sources
    const sources = JSON.stringify(relevantChunks.map((chunk: any) => ({
      text: chunk.text,
      position: `Chunk ${chunk.id}`
    })))

    // Update query with answer and sources
    await db.query.update({
      where: { id: queryId },
      data: {
        answer,
        sources
      }
    })

  } catch (error) {
    console.error('Query processing error:', error)
    await db.query.update({
      where: { id: queryId },
      data: { answer: 'An error occurred while processing your query.' }
    })
  }
}

function findRelevantChunks(chunks: any[], question: string) {
  // Simplified relevance scoring - in real implementation, use embeddings and vector search
  const questionWords = question.toLowerCase().split(' ')
  
  const scoredChunks = chunks.map(chunk => {
    const chunkText = chunk.text.toLowerCase()
    let score = 0
    
    questionWords.forEach(word => {
      if (word.length > 2 && chunkText.includes(word)) {
        score += 1
      }
    })
    
    return { ...chunk, score }
  })

  // Sort by score and return top 3 chunks
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}