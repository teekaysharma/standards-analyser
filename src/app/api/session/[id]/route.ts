import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    // Get session from database
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('Session')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Delete session and related data (cascade delete should handle this)
    const { error: deleteError } = await supabaseAdmin
      .from('Session')
      .delete()
      .eq('id', sessionId)

    if (deleteError) {
      console.error('Session deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to end session' },
        { status: 500 }
      )
    }

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