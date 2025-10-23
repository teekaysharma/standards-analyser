import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
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

    // Get documents for this session
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('Document')
      .select('*')
      .eq('sessionId', sessionId)
      .order('createdAt', { ascending: false })

    if (docsError) {
      console.error('Documents fetch error:', docsError)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json(documents || [])
  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}