import { NextRequest } from 'next/server'
import { z } from 'zod'
import { tools } from './tools'

// Conditionally import AI SDK only when needed (not in mock mode)
// These will be imported dynamically if not in mock mode

// Intent classification function
async function classifyIntent(
  userMessage: string,
  apiKey: string | undefined
): Promise<'goal' | 'chat'> {
  if (!apiKey) {
    // In mock mode, use simple pattern matching
    const goalKeywords = [
      'when', 'if', 'trigger', 'automate', 'workflow', 'connect', 
      'send', 'add', 'create', 'update', 'notify', 'sync'
    ]
    const lowerMessage = userMessage.toLowerCase()
    const hasGoalKeyword = goalKeywords.some(keyword => lowerMessage.includes(keyword))
    
    // If it's a greeting or question, it's chat
    const chatKeywords = ['hello', 'hi', 'hey', 'what', 'how', 'can you', 'help']
    const isChat = chatKeywords.some(keyword => lowerMessage.startsWith(keyword))
    
    return hasGoalKeyword && !isChat ? 'goal' : 'chat'
  }

  // Real API mode - use LLM to classify intent
  try {
    const { openai } = await import('@ai-sdk/openai')
    const { generateText } = await import('ai')
    
    const { text } = await generateText({
      model: openai('gpt-3.5-turbo', { apiKey }),
      prompt: `Classify the user's message as either "goal" (they want to create an automation workflow) or "chat" (they're asking a question or having a conversation).

Examples of "goal":
- "When a lead fills out my Typeform, add them to Airtable and send a welcome email"
- "Connect Airtable to Gmail"
- "Send new leads a text message"
- "Automate my newsletter signup process"

Examples of "chat":
- "Hello"
- "What can you do?"
- "How does this work?"
- "Help me understand workflows"

User message: "${userMessage}"

Respond with only "goal" or "chat":`,
      maxTokens: 10,
    })
    
    const intent = text.trim().toLowerCase()
    return intent === 'goal' ? 'goal' : 'chat'
  } catch (error) {
    console.error('Intent classification error:', error)
    // Fallback to pattern matching
    const goalKeywords = ['when', 'if', 'trigger', 'automate', 'workflow']
    return goalKeywords.some(keyword => userMessage.toLowerCase().includes(keyword)) ? 'goal' : 'chat'
  }
}

// Workflow generation with streaming status updates
async function* generateWorkflowWithStatus(
  goal: string,
  apiKey: string | undefined
): AsyncGenerator<string | { type: 'status' | 'blueprint'; data: any }, void, unknown> {
  const useMockMode = process.env.MOCK_MODE === 'true' || !apiKey
  
  if (useMockMode) {
    // Mock mode: stream status updates and generate mock workflow
    yield { type: 'status', data: 'Analyzing your goal...' }
    await new Promise(resolve => setTimeout(resolve, 800))
    
    yield { type: 'status', data: 'Identifying required integrations...' }
    await new Promise(resolve => setTimeout(resolve, 800))
    
    yield { type: 'status', data: 'Designing workflow steps...' }
    await new Promise(resolve => setTimeout(resolve, 800))
    
    yield { type: 'status', data: 'Generating workflow blueprint...' }
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Generate mock workflow based on pattern matching
    const goalLower = goal.toLowerCase()
    let nodes: any[] = []
    let edges: any[] = []
    let steps: any[] = []
    const workflowId = `workflow-${Date.now()}`
    
    if (goalLower.includes('typeform') || goalLower.includes('form')) {
      if (goalLower.includes('airtable')) {
        steps = [
          {
            id: 'step-1',
            name: 'Trigger: Form Submission',
            description: 'Detect when a form is submitted',
            action_type: 'webhook',
            tool: 'typeform',
            parameters: { form_id: 'to_be_configured' },
            next_step_id: 'step-2',
          },
          {
            id: 'step-2',
            name: 'Add to Airtable',
            description: 'Add the form data to Airtable',
            action_type: 'api_call',
            tool: 'airtable',
            parameters: { base_id: 'to_be_configured', table: 'Leads' },
            next_step_id: goalLower.includes('email') ? 'step-3' : null,
          },
        ]
        
        if (goalLower.includes('email') || goalLower.includes('welcome')) {
          steps.push({
            id: 'step-3',
            name: 'Send Welcome Email',
            description: 'Send a welcome email to the new lead',
            action_type: 'api_call',
            tool: 'sendgrid',
            parameters: { template_id: 'welcome_email' },
            next_step_id: null,
          })
          steps[1].next_step_id = 'step-3'
        }
      }
    } else {
      // Default generic workflow
      steps = [
        {
          id: 'step-1',
          name: 'Trigger: Event',
          description: 'Detect the trigger event',
          action_type: 'webhook',
          tool: 'generic',
          parameters: {},
          next_step_id: 'step-2',
        },
        {
          id: 'step-2',
          name: 'Process Data',
          description: 'Process and transform the data',
          action_type: 'data_transform',
          tool: 'processor',
          parameters: {},
          next_step_id: 'step-3',
        },
        {
          id: 'step-3',
          name: 'Complete Action',
          description: 'Complete the desired action',
          action_type: 'api_call',
          tool: 'integration',
          parameters: {},
          next_step_id: null,
        },
      ]
    }
    
    // Generate nodes and edges
    nodes = steps.map((step, i) => ({
      id: step.id,
      type: i === 0 ? 'input' : i === steps.length - 1 ? 'output' : 'default',
      position: { x: i * 350 + 100, y: 250 },
      data: {
        label: step.name,
        description: step.description,
        tool: step.tool,
        action_type: step.action_type,
      },
    }))
    
    edges = steps
      .filter(step => step.next_step_id)
      .map(step => ({
        id: `edge-${step.id}-${step.next_step_id}`,
        source: step.id,
        target: step.next_step_id!,
        type: 'smoothstep',
      }))
    
    yield {
      type: 'blueprint',
      data: {
        workflow_id: workflowId,
        goal,
        nodes,
        edges,
        steps,
      },
    }
    return
  }
  
  // Real API mode: Call Python backend for workflow generation
  // For now, we'll call the backend and stream status updates
  // TODO: In the future, we can integrate CrewAI directly or use a streaming backend
  
  yield { type: 'status', data: 'Analyzing your goal...' }
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/workflow/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, context: {} }),
    })
    
    if (!response.ok) {
      throw new Error(`Workflow generation failed: ${response.statusText}`)
    }
    
    yield { type: 'status', data: 'Designing workflow steps...' }
    
    const blueprint = await response.json()
    
    yield {
      type: 'blueprint',
      data: blueprint,
    }
  } catch (error) {
    console.error('Workflow generation error:', error)
    throw error
  }
}

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
    const lastUserMessage = Array.isArray(messages) 
      ? messages.filter((m: any) => m.role === 'user').pop() 
      : null
    userGoal = lastUserMessage?.content || ''
    console.log('[API /api/chat] User goal:', userGoal)

    // Check if we should use mock/demo mode
    const useMockMode = process.env.MOCK_MODE === 'true' || !process.env.OPENAI_API_KEY
    const apiKey = process.env.OPENAI_API_KEY
    console.log('[API /api/chat] Mock mode:', useMockMode, 'API key present:', !!apiKey)
    
    // Classify intent (Goal vs Chat)
    const intent = userGoal ? await classifyIntent(userGoal, apiKey) : 'chat'
    console.log('[API /api/chat] Intent:', intent)
    
    // If it's a goal, we need to handle workflow generation
    if (intent === 'goal' && userGoal) {
      // Use mock mode if configured or if no API key
      if (useMockMode) {
        console.log('[API /api/chat] Using mock mode for workflow generation')
        
        // Create a streaming response with status updates and blueprint
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // First, send confirmation message
              const confirmation = `Got it! You want to: ${userGoal.toLowerCase().replace(/^when /i, 'automatically trigger when ')}. Let me create that workflow for you...`
              const confirmationChunk = `0:"${confirmation.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`
              controller.enqueue(encoder.encode(confirmationChunk))
              
              // Stream workflow generation with status updates
              for await (const update of generateWorkflowWithStatus(userGoal, apiKey)) {
                if (update.type === 'status') {
                  // Stream status update as a text delta
                  const statusChunk = `0:"${update.data.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`
                  controller.enqueue(encoder.encode(statusChunk))
                  await new Promise(resolve => setTimeout(resolve, 100))
                } else if (update.type === 'blueprint') {
                  // Send blueprint as a tool call
                  const toolCallId = `tool-call-${Date.now()}`
                  const toolCallChunk = `2:{"toolCalls":[{"toolCallId":"${toolCallId}","toolName":"renderWorkflowBlueprint","args":${JSON.stringify(update.data)}}]}\n`
                  controller.enqueue(encoder.encode(toolCallChunk))
                }
              }
              
              // Send finish signal
              const finishChunk = `d:{"finishReason":"stop"}\n`
              controller.enqueue(encoder.encode(finishChunk))
              
              controller.close()
            } catch (err) {
              console.error('[API /api/chat] Mock workflow stream error:', err)
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
      
      // Real API mode for workflow generation
      // Dynamically import AI SDK
      const { streamText, tool } = await import('ai')
      const { openai } = await import('@ai-sdk/openai')
      
      // Convert tools object to AI SDK tool format
      const aiTools = {
        askForApiKey: tool({
          description: tools.askForApiKey.description,
          parameters: tools.askForApiKey.parameters,
          execute: async ({ service }: { service: string }) => {
            return `Waiting for ${service} API key from user...`
          },
        }),
        askForSelection: tool({
          description: tools.askForSelection.description,
          parameters: tools.askForSelection.parameters,
          execute: async ({ title, options }: { title: string; options: string[] }) => {
            return `Waiting for user selection: ${title}`
          },
        }),
        renderWorkflowBlueprint: tool({
          description: tools.renderWorkflowBlueprint.description,
          parameters: tools.renderWorkflowBlueprint.parameters,
          execute: async (blueprint: any) => {
            // The blueprint will be rendered on the frontend
            return `Workflow blueprint generated with ${blueprint.nodes.length} steps`
          },
        }),
      }
      
      // Stream workflow generation
      // First, generate the workflow by calling the backend
      // Then stream status updates and final blueprint
      const workflowGenerator = generateWorkflowWithStatus(userGoal, apiKey)
      
      // Create a custom stream that combines status updates with AI response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send confirmation
            const confirmation = `Got it! You want to: ${userGoal.toLowerCase().replace(/^when /i, 'automatically trigger when ')}. Let me create that workflow for you...`
            const confirmationChunk = `0:"${confirmation.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`
            controller.enqueue(encoder.encode(confirmationChunk))
            
            let blueprint: any = null
            
            // Stream status updates and get blueprint
            for await (const update of workflowGenerator) {
              if (update.type === 'status') {
                // Stream status update
                const statusChunk = `0:"${update.data.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`
                controller.enqueue(encoder.encode(statusChunk))
                await new Promise(resolve => setTimeout(resolve, 100))
              } else if (update.type === 'blueprint') {
                blueprint = update.data
              }
            }
            
            // Send blueprint as tool call
            if (blueprint) {
              const toolCallId = `tool-call-${Date.now()}`
              const toolCallChunk = `2:{"toolCalls":[{"toolCallId":"${toolCallId}","toolName":"renderWorkflowBlueprint","args":${JSON.stringify(blueprint)}}]}\n`
              controller.enqueue(encoder.encode(toolCallChunk))
            }
            
            // Send finish signal
            const finishChunk = `d:{"finishReason":"stop"}\n`
            controller.enqueue(encoder.encode(finishChunk))
            
            controller.close()
          } catch (err) {
            console.error('[API /api/chat] Workflow stream error:', err)
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
    
    // Simple chat mode (not a goal)
    if (useMockMode) {
      console.log('[API /api/chat] Using mock mode for chat')
      const mockResponse = userGoal 
        ? `Got it! You want to: ${userGoal.toLowerCase().replace(/^when /i, 'automatically trigger when ')}. Let me create that workflow for you...`
        : `Got it! Let me create that workflow for you...`
      
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const textChunk = `0:"${mockResponse.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`
            controller.enqueue(encoder.encode(textChunk))
            
            await new Promise(resolve => setTimeout(resolve, 100))
            
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
          return `Waiting for ${service} API key from user...`
        },
      }),
      askForSelection: tool({
        description: tools.askForSelection.description,
        parameters: tools.askForSelection.parameters,
        execute: async ({ title, options }: { title: string; options: string[] }) => {
          return `Waiting for user selection: ${title}`
        },
      }),
      renderWorkflowBlueprint: tool({
        description: tools.renderWorkflowBlueprint.description,
        parameters: tools.renderWorkflowBlueprint.parameters,
        execute: async (blueprint: any) => {
          return `Workflow blueprint generated with ${blueprint.nodes.length} steps`
        },
      }),
    }
    
    // Stream a response for simple chat
    const result = streamText({
      model: openai('gpt-3.5-turbo', {
        apiKey: apiKey,
      }),
      messages: [
        {
          role: 'system',
          content: `You are Alan, a helpful AI assistant that helps users create business automation workflows.
            
            When a user describes a goal (like "connect airtable to gmail" or "send new leads a text"), you should:
            1. Acknowledge their goal
            2. Use the renderWorkflowBlueprint tool to show them the workflow
            
            For simple questions or conversations, respond naturally and helpfully.
            
            IMPORTANT: If you need an API key for a service, use the askForApiKey tool.
            If you need the user to choose between options, use the askForSelection tool.
            
            Keep responses concise, reassuring, and professional.`,
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
    if (!userGoal) {
      const lastUserMessage = Array.isArray(messages) 
        ? messages.filter((m: any) => m.role === 'user').pop() 
        : null
      userGoal = lastUserMessage?.content || 'your goal'
    }
    const mockResponse = userGoal 
      ? `Got it! You want to: ${userGoal.toLowerCase().replace(/^when /i, 'automatically trigger when ')}. Let me create that workflow for you...`
      : `Got it! Let me create that workflow for you...`
    
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const textChunk = `0:"${mockResponse.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`
          controller.enqueue(encoder.encode(textChunk))
          
          await new Promise(resolve => setTimeout(resolve, 100))
          
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
