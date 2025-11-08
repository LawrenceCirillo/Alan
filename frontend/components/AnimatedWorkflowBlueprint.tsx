'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import ReactFlow, {
  Background,
  Node,
  Edge,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  NodeTypes,
  EdgeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { WorkflowBlueprintData } from '@/types/workflow'
import { CheckCircle2, XCircle, Edit2, Save, PlusCircle } from 'lucide-react'
import WorkflowNode from './workflow/WorkflowNode'
import { Actions, ActionButton, PrimaryActionButton } from '@/components/ai/actions'
import WorkflowLegend from './workflow/WorkflowLegend'
import WorkflowZoomControls from './workflow/WorkflowZoomControls'
import NodeTooltip from './workflow/NodeTooltip'
import NodeConfigurationDialog from './workflow/NodeConfigurationDialog'

// We'll create nodeTypes inside the component to pass onNodeClick prop
const edgeTypes: EdgeTypes = {}

interface AnimatedWorkflowBlueprintProps {
  blueprint: WorkflowBlueprintData
  onNodeClick?: (nodeData: {
    id: string
    label: string
    tool: string
    actionType: string
    description: string
    stepNumber: number
  }) => void
  onReferenceNodeInChat?: (nodeData: {
    id: string
    label: string
    tool: string
    actionType: string
    description: string
    stepNumber: number
  }) => void
}

function FlowContent({ nodes, edges, isBuilding }: { nodes: Node[], edges: Edge[], isBuilding: boolean }) {
  const { fitView } = useReactFlow()

  // Fit view after building completes - zoomed out more
  useEffect(() => {
    if (!isBuilding && nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.6, maxZoom: 1.0, minZoom: 0.2, duration: 400 })
      }, 200)
    }
  }, [isBuilding, nodes.length, fitView])

  return (
    <>
      <Background variant="dots" gap={12} size={1} className="opacity-30" />
      <WorkflowLegend />
      <WorkflowZoomControls />
    </>
  )
}

// Container component to access React Flow context for tooltip positioning
function TooltipContainer({ 
  children, 
  hoveredNode, 
  tooltipPosition, 
  zoomLevel 
}: { 
  children: React.ReactNode
  hoveredNode: any
  tooltipPosition: { x: number; y: number }
  zoomLevel: number
}) {
  return (
    <>
      {children}
      {/* Tooltip rendered with zoom-aware positioning */}
      {hoveredNode && (
        <NodeTooltip 
          nodeData={hoveredNode} 
          position={tooltipPosition}
          visible={!!hoveredNode}
          zoomLevel={zoomLevel}
        />
      )}
    </>
  )
}

export default function AnimatedWorkflowBlueprint({ blueprint, onNodeClick, onReferenceNodeInChat }: AnimatedWorkflowBlueprintProps) {
  const [hoveredNode, setHoveredNode] = useState<{
    label: string
    tool: string
    actionType: string
    description: string
    stepNumber: number
  } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(0.5)
  const [configuredNodeId, setConfiguredNodeId] = useState<string | null>(null)
  const [nodeConfigurations, setNodeConfigurations] = useState<Record<string, {
    type: 'oauth' | 'api_key' | 'webhook'
    value: string
    connected?: boolean
  }>>({})
  
  // Create nodeTypes with onNodeClick handler
  const nodeTypes: NodeTypes = useMemo(() => ({
    default: (props: any) => (
      <WorkflowNode 
        {...props} 
        onNodeClick={(nodeData) => {
          // Call both handlers
          if (onNodeClick) onNodeClick(nodeData)
          if (onReferenceNodeInChat) onReferenceNodeInChat(nodeData)
        }}
        onNodeHover={(nodeData, position) => {
          setHoveredNode(nodeData)
          setTooltipPosition(position)
        }}
        onNodeHoverEnd={() => setHoveredNode(null)}
        onConfigure={(nodeId) => setConfiguredNodeId(nodeId)}
        isConfigured={!!nodeConfigurations[props.data?.id || props.id]}
      />
    ),
  }), [onNodeClick, onReferenceNodeInChat, nodeConfigurations])
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | 'editing'>('pending')
  const [workflowName, setWorkflowName] = useState('')
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  
  // Animation state: tracks which nodes are visible
  const [visibleNodeCount, setVisibleNodeCount] = useState(0)
  const [isBuilding, setIsBuilding] = useState(true)

  // Reset animation when blueprint changes
  useEffect(() => {
    setVisibleNodeCount(0)
    setIsBuilding(true)
    // Start showing first node immediately after a brief delay
    const timer = setTimeout(() => {
      if (blueprint.nodes.length > 0) {
        setVisibleNodeCount(1)
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [blueprint.workflow_id, blueprint.nodes.length])

  // Animate nodes appearing one by one
  useEffect(() => {
    if (visibleNodeCount > 0 && visibleNodeCount < blueprint.nodes.length) {
      const timer = setTimeout(() => {
        setVisibleNodeCount(prev => {
          const next = prev + 1
          if (next >= blueprint.nodes.length) {
            setIsBuilding(false)
          }
          return next
        })
      }, 600) // 600ms delay between each node
      return () => clearTimeout(timer)
    } else if (visibleNodeCount === blueprint.nodes.length && blueprint.nodes.length > 0) {
      // All nodes are visible, building complete
      setIsBuilding(false)
    }
  }, [visibleNodeCount, blueprint.nodes.length])

  // Convert blueprint data to React Flow format with animation
  const nodes: Node[] = useMemo(() => {
    return blueprint.nodes.slice(0, visibleNodeCount).map((node, index) => {
      // Ensure positions are properly set - use the node's position if available, otherwise calculate
      const position = node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number'
        ? node.position
        : { x: index * 350 + 100, y: 250 } // Consistent Y position for horizontal alignment
      
      return {
        id: node.id,
        type: 'default', // Use our custom node type
        position: position,
        data: {
          ...node.data,
          stepNumber: index + 1, // Add step number for display
        },
        style: {
          opacity: 1,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }
    })
  }, [blueprint.nodes, visibleNodeCount])

  // Get the node being configured
  const configuringNode = configuredNodeId 
    ? nodes.find(n => n.id === configuredNodeId)
    : null

  const handleSaveConfiguration = (config: {
    type: 'oauth' | 'api_key' | 'webhook'
    value: string
    connected?: boolean
  }) => {
    if (configuredNodeId) {
      if (config.value) {
        setNodeConfigurations(prev => ({
          ...prev,
          [configuredNodeId]: config,
        }))
      } else {
        // Remove configuration if value is empty
        const newConfigs = { ...nodeConfigurations }
        delete newConfigs[configuredNodeId]
        setNodeConfigurations(newConfigs)
      }
      setConfiguredNodeId(null)
    }
  }

  // Only show edges that connect visible nodes
  const edges: Edge[] = useMemo(() => {
    const visibleNodeIds = new Set(nodes.map(n => n.id))
    return blueprint.edges
      .filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
      .map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: 'source', // Use the source handle ID
        targetHandle: 'target', // Use the target handle ID
        type: 'smoothstep', // Use smoothstep for better visual flow
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
          width: 24,
          height: 24,
        },
        style: {
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2.5,
          opacity: isBuilding ? 0.4 : 0.8,
          transition: 'opacity 0.5s ease',
        },
        animated: isBuilding, // Animate edges while building
      }))
  }, [blueprint.edges, nodes, isBuilding])

  const handleActivate = () => {
    setApprovalStatus('approved')
    setShowSavePrompt(true)
    console.log('Workflow activated:', blueprint.workflow_id)
  }

  const handleReject = () => {
    const feedback = prompt('What would you like to change about this workflow?')
    if (feedback) {
      console.log('User feedback:', feedback)
      setApprovalStatus('rejected')
    }
  }

  const handleEdit = () => {
    setApprovalStatus('editing')
    console.log('Edit mode enabled:', blueprint.workflow_id)
  }

  const handleSave = () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name')
      return
    }
    console.log('Saving workflow:', workflowName, blueprint.workflow_id)
    setShowSavePrompt(false)
  }

  const handleCreateAnother = () => {
    console.log('Creating another workflow')
    window.location.reload()
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', minHeight: '500px' }}>
      {/* Building Progress Indicator */}
      {isBuilding && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Building your workflow...</p>
              <p className="text-xs text-muted-foreground">
                Step {visibleNodeCount} of {blueprint.nodes.length}
              </p>
            </div>
            <div className="text-xs font-medium text-primary">
              {Math.round((visibleNodeCount / blueprint.nodes.length) * 100)}%
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(visibleNodeCount / blueprint.nodes.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* React Flow Viewer */}
      <div className="flex-1 overflow-hidden bg-background relative">
        <ReactFlowProvider>
          <TooltipContainer 
            hoveredNode={hoveredNode}
            tooltipPosition={tooltipPosition}
            zoomLevel={zoomLevel}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              preventScrolling={false}
              defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
              onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
              onMoveEnd={(_, viewport) => setZoomLevel(viewport.zoom)}
              fitView
              fitViewOptions={{ padding: 0.6, maxZoom: 1.5, minZoom: 0.2 }}
              connectionMode="loose"
            >
              <FlowContent nodes={nodes} edges={edges} isBuilding={isBuilding} />
            </ReactFlow>
          </TooltipContainer>
        </ReactFlowProvider>
      </div>

      {/* Node Configuration Dialog */}
      {configuringNode && (
        <NodeConfigurationDialog
          nodeId={configuringNode.id}
          nodeLabel={configuringNode.data?.label || 'Node'}
          tool={configuringNode.data?.tool || 'Service'}
          isOpen={!!configuredNodeId}
          onClose={() => setConfiguredNodeId(null)}
          onSave={handleSaveConfiguration}
          existingConfig={nodeConfigurations[configuringNode.id] || null}
        />
      )}

      {/* Approval Actions */}
      <div className="px-4 py-3 border-t border-border bg-card/50">
        {/* Pending State: Review & Approve/Edit/Reject */}
        {approvalStatus === 'pending' && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {isBuilding ? 'Generating...' : 'Review before activating'}
            </p>
            <Actions>
              <ActionButton onClick={handleReject} disabled={isBuilding}>
                <XCircle className="h-3.5 w-3.5" />
                Request Changes
              </ActionButton>
              <ActionButton onClick={handleEdit} disabled={isBuilding}>
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </ActionButton>
              <PrimaryActionButton onClick={handleActivate} disabled={isBuilding}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Activate
              </PrimaryActionButton>
            </Actions>
          </div>
        )}

        {/* Approved State: Save Workflow & Manage */}
        {approvalStatus === 'approved' && (
          <div className="space-y-4">
            {showSavePrompt ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Workflow activated!</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="workflow-name" className="block text-xs font-medium text-muted-foreground mb-2">
                      Give your workflow a name
                    </label>
                    <input
                      id="workflow-name"
                      type="text"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="e.g., Lead Nurture Flow"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Workflow
                    </button>
                    <button
                      onClick={handleCreateAnother}
                      className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create Another
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground block">
                      {workflowName || 'Workflow saved!'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Your workflow is now active
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setApprovalStatus('editing')}
                    className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleCreateAnother}
                    className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editing State */}
        {approvalStatus === 'editing' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Edit2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Edit mode enabled</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Click nodes to edit them, or drag to rearrange. (Feature coming soon)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setApprovalStatus('pending')}
                className="px-5 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Rejected State */}
        {approvalStatus === 'rejected' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Changes requested - Alan is updating the workflow
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
