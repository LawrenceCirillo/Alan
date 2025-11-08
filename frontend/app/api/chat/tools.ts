import { z } from 'zod'

export const tools = {
  // Tool to ask for a secret key (e.g., API key)
  askForApiKey: {
    description: 'Ask the user for an API key for a specific service.',
    parameters: z.object({
      service: z.string().describe('The name of the service, e.g., "Mailchimp" or "Airtable"'),
    }),
  },
  // Tool to ask the user to pick one option
  askForSelection: {
    description: 'Ask the user to select one option from a list.',
    parameters: z.object({
      title: z.string().describe('The question to ask, e.g., "Which list to add them to?"'),
      options: z.array(z.string()).describe('The list of options to present.'),
    }),
  },
  // Tool to render a workflow blueprint
  renderWorkflowBlueprint: {
    description: 'Render a workflow blueprint visualization when a workflow has been generated. Use this after completing workflow generation.',
    parameters: z.object({
      workflow_id: z.string().describe('Unique identifier for the workflow'),
      goal: z.string().describe('The original goal that generated this workflow'),
      nodes: z.array(z.object({
        id: z.string(),
        type: z.string(),
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
        data: z.object({
          label: z.string(),
          description: z.string().optional(),
          tool: z.string().optional(),
          action_type: z.string().optional(),
        }),
      })).describe('React Flow nodes array'),
      edges: z.array(z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        type: z.string().optional(),
      })).describe('React Flow edges array'),
      steps: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        action_type: z.string(),
        tool: z.string(),
        parameters: z.record(z.any()),
        next_step_id: z.string().nullable().optional(),
      })).describe('Workflow steps array'),
    }),
  },
}
