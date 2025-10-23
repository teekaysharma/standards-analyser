import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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
    const { data: document, error: docError } = await supabaseAdmin
      .from('Document')
      .select(`
        *,
        session:Session(*)
      `)
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Verify session is valid
    if (!document.session.isActive || new Date() > new Date(document.session.expiresAt)) {
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
    const { data: query, error: queryError } = await supabaseAdmin
      .from('Query')
      .insert({
        id: uuidv4(),
        sessionId: document.sessionId,
        documentId,
        query: question,
        response: 'Processing...'
      })
      .select()
      .single()

    if (queryError) {
      console.error('Query creation error:', queryError)
      return NextResponse.json(
        { error: 'Failed to create query' },
        { status: 500 }
      )
    }

    // Process query asynchronously
    processQuery(query.id, document, question).catch(console.error)

    return NextResponse.json({
      query: {
        id: query.id,
        query: query.query,
        response: query.response,
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
    const { data: chunks, error: chunksError } = await supabaseAdmin
      .from('Chunk')
      .select('*')
      .eq('documentId', document.id)
    
    if (chunksError || !chunks || chunks.length === 0) {
      await supabaseAdmin
        .from('Query')
        .update({ response: 'No content available in this document.' })
        .eq('id', queryId)
      return
    }

    // Find relevant chunks (simplified - in real implementation, use vector search)
    const relevantChunks = findRelevantChunks(chunks, question)

    // Create context from relevant chunks
    const context = relevantChunks.map((chunk: any) => chunk.content).join('\n\n')

    // Generate a simple answer (without AI SDK for now)
    const answer = generateSimpleAnswer(context, question)

    // Update query with answer
    await supabaseAdmin
      .from('Query')
      .update({ response: answer })
      .eq('id', queryId)

  } catch (error) {
    console.error('Query processing error:', error)
    await supabaseAdmin
      .from('Query')
      .update({ response: 'An error occurred while processing your query.' })
      .eq('id', queryId)
  }
}

function generateSimpleAnswer(context: string, question: string): string {
  // Simple answer generation without AI SDK
  const contextWords = context.toLowerCase()
  const questionWords = question.toLowerCase()
  
  if (contextWords.includes(questionWords) || questionWords.split(' ').some((word: string) => contextWords.includes(word))) {
    return `Based on the document content: ${context.substring(0, 200)}... This information relates to your question about "${question}".`
  } else {
    return `I found information in the document but cannot provide a specific answer to "${question}". The document contains: ${context.substring(0, 150)}...`
  }
}

function findRelevantChunks(chunks: any[], question: string) {
  // Simplified relevance scoring - in real implementation, use embeddings and vector search
  const questionWords = question.toLowerCase().split(' ')
  
  const scoredChunks = chunks.map(chunk => {
    const chunkText = chunk.content.toLowerCase()
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