"""
Sender Backend - AI-Powered Workflow Generation API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

from agents.workflow_planner import WorkflowPlanner
from schemas.workflow import WorkflowBlueprint

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Sender API",
    description="AI-Powered Automation Platform Backend",
    version="1.0.0"
)

# CORS Configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Workflow Planner
workflow_planner = WorkflowPlanner()


class WorkflowRequest(BaseModel):
    """Request model for workflow generation"""
    goal: str
    context: Optional[Dict[str, Any]] = None


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Sender API is running"}


@app.post("/api/workflow/generate", response_model=WorkflowBlueprint)
async def generate_workflow(request: WorkflowRequest):
    """
    Generate a workflow blueprint from a natural language goal.
    
    The AI agent will:
    1. Understand the user's goal
    2. Break it down into steps
    3. Generate a React Flow compatible blueprint
    """
    try:
        # Run the workflow planner (synchronous but CPU-intensive, so run in thread pool)
        import asyncio
        import traceback
        loop = asyncio.get_event_loop()
        blueprint = await loop.run_in_executor(
            None,
            workflow_planner.plan_workflow,
            request.goal,
            request.context or {}
        )
        return blueprint
    except Exception as e:
        import traceback
        error_detail = str(e)
        error_traceback = traceback.format_exc()
        print(f"Error generating workflow: {error_detail}")
        print(f"Traceback: {error_traceback}")
        raise HTTPException(status_code=500, detail=f"Error generating workflow: {error_detail}")


@app.get("/api/workflow/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Retrieve a previously generated workflow"""
    # TODO: Implement workflow storage/retrieval
    return {"message": "Workflow retrieval not yet implemented"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

