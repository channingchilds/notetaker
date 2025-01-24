import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    // For now, return a simple summary (we'll add AI integration later)
    const summary = `This is a summary of: ${content.slice(0, 100)}...`

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
} 