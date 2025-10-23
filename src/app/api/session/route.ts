import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Create a new session
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    
    const session = await db.session.create({
      data: {
        id: uuidv4(),
        token,
        expiresAt,
        isActive: true
      }
    })

    // Set session cookie
    const response = NextResponse.json({
      id: session.id,
      token: session.token,
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