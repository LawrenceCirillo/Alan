'use client'

import { useState, useMemo, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
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

// Define nodeTypes and edgeTypes outside component to avoid React Flow warning
const nodeTypes: NodeTypes = {}
const edgeTypes: EdgeTypes = {}

interface InlineWorkflowCanvasProps {
  blueprint: WorkflowBlueprintData
}

function FlowContent({ nodes, edges, isBuilding }: { nodes: Node[], edges: Edge[], isBuilding: boolean }) {
  const { fitView } = useReactFlow()

  // Fit view after building completes
  useEffect(() => {
    if (!isBuilding && nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, maxZoom: 1.5, minZoom: 0.5 })
      }, 100)
    }
  }, [isBuilding, nodes.length, fitView])

  return (
    <>
      <Background />
      <Controls />
      <MiniMap />
    </>
  )
}

export default function InlineWorkflowCanvas({ blueprint }: InlineWorkflowCanvasProps) {
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
        : { x: index * 300 + 100, y: 150 } // Fallback positioning with more spacing
      
      return {
        id: node.id,
        type: node.type,
        position: position,
        data: {
          label: (
            <div className="px-4 py-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="font-semibold text-sm text-foreground mb-1.5 leading-tight">
                {node.data.label}
              </div>
              <div className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {node.data.description}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 font-medium">
                  {node.data.tool}
                </span>
                <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded border border-border">
                  {node.data.action_type}
                </span>
              </div>
            </div>
          ),
        },
        style: {
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          padding: 0,
          width: 240,
          minHeight: 120,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          opacity: 1,
          transform: 'scale(1)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }
    })
  }, [blueprint.nodes, visibleNodeCount])

  // Only show edges that connect visible nodes
  const edges: Edge[] = useMemo(() => {
    const visibleNodeIds = new Set(nodes.map(n => n.id))
    return blueprint.edges
      .filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
      .map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--muted-foreground))',
          width: 20,
          height: 20,
        },
        style: {
          stroke: 'hsl(var(--muted-foreground))',
          strokeWidth: 1.5,
          opacity: 0.6,
          transition: 'opacity 0.5s ease',
        },
        animated: isBuilding, // Animate edges while building
      }))
  }, [blueprint.edges, nodes, isBuilding])

  return (
    <div className="flex flex-col h-full">
      {/* Building Progress Indicator */}
      {isBuilding && (
        <div className="mb-3 px-3 py-2 bg-primary/5 border border-primary/20 rounded-md">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Building workflow...</p>
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
      <div className="flex-1 border border-border rounded-md overflow-hidden bg-background">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            preventScrolling={false}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <FlowContent nodes={nodes} edges={edges} isBuilding={isBuilding} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  )
}

