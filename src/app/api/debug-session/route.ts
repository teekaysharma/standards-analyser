import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG SESSION CREATION ===')
    
    // Check environment variables
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
    console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
    console.log('Supabase Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set')
    
    // Test Supabase connection
    console.log('Testing Supabase connection...')
    const { data: testData, error: testError } = await supabaseAdmin.from('Session').select('count', { count: 'exact', head: true })
    
    if (testError) {
      console.error('Supabase connection test failed:', testError)
      return NextResponse.json({ 
        error: 'Supabase connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 })
    }
    
    console.log('Supabase connection successful')
    
    // Create a new session
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    
    console.log('Creating session with ID:', sessionId)
    
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
      return NextResponse.json({ 
        error: 'Failed to create session',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }

    console.log('Session created successfully:', session)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
        createdAt: session.createdAt
      }
    })
  } catch (error) {
    console.error('Unexpected error in debug session:', error)
    return NextResponse.json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}