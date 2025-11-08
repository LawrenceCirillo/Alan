/**
 * Type definitions for workflow data structures
 */

export interface WorkflowStep {
  id: string
  name: string
  description: string
  action_type: string
  tool: string
  parameters: Record<string, any>
  next_step_id?: string | null
}

export interface WorkflowBlueprintData {
  workflow_id: string
  goal: string
  steps: WorkflowStep[]
  edges: Array<{
    id: string
    source: string
    target: string
    type?: string
  }>
  nodes: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    data: {
      label: string
      description: string
      tool: string
      action_type: string
    }
  }>
}

