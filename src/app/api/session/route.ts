import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Create a new session
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    
    const { data: session, error } = await supabaseAdmin
      .from('Session')
      .insert({
        id: sessionId,
        expiresAt: expiresAt.toISOString(),
        isActive: true
      })
      .select()
      .single()

    if (error) {
      console.error('Session creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Set session cookie
    const response = NextResponse.json({
      id: session.id,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
      createdAt: session.createdAt
    })

    // Set HTTP-only cookie for session management
    response.cookies.set('sessionId', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 // 30 minutes
    })

    return response
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}