"""
Pydantic schemas for workflow data structures
"""
from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class WorkflowStep(BaseModel):
    """Individual step in a workflow"""
    id: str
    name: str
    description: str
    action_type: str  # e.g., "api_call", "data_transform", "notification"
    tool: str  # e.g., "airtable", "sendgrid", "webhook"
    parameters: Dict[str, Any]
    next_step_id: Optional[str] = None


class WorkflowBlueprint(BaseModel):
    """Complete workflow blueprint with React Flow compatible structure"""
    workflow_id: str
    goal: str
    steps: List[WorkflowStep]
    edges: List[Dict[str, Any]]  # React Flow edges format
    nodes: List[Dict[str, Any]]  # React Flow nodes format

