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
}

