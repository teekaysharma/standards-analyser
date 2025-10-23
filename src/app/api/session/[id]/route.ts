import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    // Get session from database
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        documents: {
          include: {
            chunks: true,
            queries: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Delete all related data (cascade delete should handle this, but let's be explicit)
    for (const document of session.documents) {
      // Delete chunks and queries for this document
      await db.chunk.deleteMany({
        where: { documentId: document.id }
      })
      await db.query.deleteMany({
        where: { documentId: document.id }
      })
    }

    // Delete documents
    await db.document.deleteMany({
      where: { sessionId: sessionId }
    })

    // Delete session
    await db.session.delete({
      where: { id: sessionId }
    })

    // Clear session cookie
    const response = NextResponse.json({ message: 'Session ended successfully' })
    response.cookies.delete('sessionId')

    return response
  } catch (error) {
    console.error('Session deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    )
  }
}