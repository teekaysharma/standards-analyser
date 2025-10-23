import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    // Get session from database
    const { data: session, error } = await supabaseAdmin
      .from('Session')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt) || !session.isActive) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      id: session.id,
      token: session.token,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
      createdAt: session.createdAt
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    )
  }
}