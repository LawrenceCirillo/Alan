import { NextRequest } from 'next/server'
import { z } from 'zod'
import { tools } from './tools'

// Conditionally import AI SDK only when needed (not in mock mode)
// These will be imported dynamically if not in mock mode

export async function POST(req: NextRequest) {
  let messages: any[] = []
  let userGoal = ''
  
  try {
    console.log('[API /api/chat] Request received')
    const body = await req.json()
    console.log('[API /api/chat] Body parsed:', body)
    messages = body?.messages || []
    console.log('[API /api/chat] Messages:', messages.length)

    // Get the last user message
    const lastUserMessage = Array.isArray(messages) ? messages.filter((m: any) => m.role === 'user').pop() : null
    userGoal = lastUserMessage?.content || ''
    console.log('[API /api/chat] User goal:', userGoal)

    // Check if we should use mock/demo mode
    // Use mock mode if MOCK_MODE is set to 'true' OR if no API key is available
    const useMockMode = process.env.MOCK_MODE === 'true' || !process.env.OPENAI_API_KEY
    const apiKey = process.env.OPENAI_API_KEY
    console.log('[API /api/chat] Mock mode:', useMockMode, 'API key present:', !!apiKey)
    
    // Use mock mode if configured or if no API key
    if (useMockMode) {
      console.log('[API /api/chat] Using mock mode')
      // Create a proper mock streaming response with confirmation and summary
      const mockResponse = userGoal 
        ? `Got it! You want to: ${userGoal.toLowerCase().replace(/^when /i, 'automatically trigger when ')}. Let me create that workflow for you...`
        : `Got it! Let me create that workflow for you...`
      
      // Create a proper SSE stream that useChat can parse
      // The Vercel AI SDK expects a specific data stream format
      // Format: 0:"text" for text chunks, d:{"finishReason":"stop"} for completion
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send text in chunks - the format needs to match Vercel AI SDK's data stream
            // First, send the full text as a single chunk (simpler and more reliable)
            const textChunk = `0:"${mockResponse.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`
            controller.enqueue(encoder.encode(textChunk))
            
            // Small delay for streaming effect
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Send finish signal
            const finishChunk = `d:{"finishReason":"stop"}\n`
            controller.enqueue(encoder.encode(finishChunk))
            
            controller.close()
          } catch (err) {
            console.error('[API /api/chat] Mock stream error:', err)
            controller.error(err)
          }
        },
      })
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Real API mode - dynamically import AI SDK
    const { streamText, tool } = await import('ai')
    const { openai } = await import('@ai-sdk/openai')
    
    // Convert tools object to AI SDK tool format
    const aiTools = {
      askForApiKey: tool({
        description: tools.askForApiKey.description,
        parameters: tools.askForApiKey.parameters,
        execute: async ({ service }: { service: string }) => {
          // This will be handled by the render function on the frontend
          return `Waiting for ${service} API key from user...`
        },
      }),
      askForSelection: tool({
        description: tools.askForSelection.description,
        parameters: tools.askForSelection.parameters,
        execute: async ({ title, options }: { title: string; options: string[] }) => {
          // This will be handled by the render function on the frontend
          return `Waiting for user selection: ${title}`
        },
      }),
    }
    
    // Stream a response that acknowledges the user's goal
    const result = streamText({
      model: openai('gpt-3.5-turbo', {
        apiKey: apiKey,
      }),
           messages: [
             {
               role: 'system',
               content: `You are Alan, a helpful AI assistant that helps users create business automation workflows.
                
                When a user first describes their goal, respond with:
                1. A brief confirmation that you understand
                2. A paraphrased summary of what they want (e.g., "Got it! You want to: [paraphrase their goal]")
                3. Let them know you're creating their workflow
                
                IMPORTANT: If you need an API key for a service (like Mailchimp, Airtable, SendGrid, etc.), use the askForApiKey tool.
                If you need the user to choose between options (like which list to use, which template, etc.), use the askForSelection tool.
                
                Keep responses concise, reassuring, and professional. Your goal is to make the user confident in the automation you're building.`,
             },
             ...messages,
           ],
      tools: aiTools,
      maxSteps: 5,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Fallback to mock mode on error
    console.error('[API /api/chat] Error caught, falling back to mock mode')
    // Use existing userGoal if available, otherwise use default
    if (!userGoal) {
      const lastUserMessage = Array.isArray(messages) ? messages.filter((m: any) => m.role === 'user').pop() : null
      userGoal = lastUserMessage?.content || 'your goal'
    }
    const mockResponse = userGoal 
      ? `Got it! You want to: ${userGoal.toLowerCase().replace(/^when /i, 'automatically trigger when ')}. Let me create that workflow for you...`
      : `Got it! Let me create that workflow for you...`
    
    // Create a proper SSE stream that useChat can parse
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send the full text response
          const textChunk = `0:"${mockResponse.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`
          controller.enqueue(encoder.encode(textChunk))
          
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Send finish signal
          const finishChunk = `d:{"finishReason":"stop"}\n`
          controller.enqueue(encoder.encode(finishChunk))
          
          controller.close()
        } catch (err) {
          console.error('[API /api/chat] Fallback stream error:', err)
          controller.error(err)
        }
      },
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }
}

