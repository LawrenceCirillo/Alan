"""
Workflow Planner Agent
Uses CrewAI to orchestrate workflow planning from natural language goals.
"""
import os
import uuid
from typing import Dict, Any, List
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from schemas.workflow import WorkflowBlueprint, WorkflowStep


class WorkflowPlanner:
    """
    Main orchestrator for workflow planning.
    Uses CrewAI to create agents that understand goals and generate workflows.
    """
    
    def __init__(self):
        """Initialize the workflow planner with CrewAI agents"""
        # Model options (in order of preference):
        # - gpt-4o: Latest and most capable (requires API access)
        # - gpt-4-turbo: Good performance (may require access)
        # - gpt-4: Reliable but older
        # - gpt-3.5-turbo: Most widely available, good for testing (default)
        model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=0.7,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Create specialized agents
        self.goal_analyzer = self._create_goal_analyzer()
        self.workflow_designer = self._create_workflow_designer()
        self.blueprint_generator = self._create_blueprint_generator()
    
    def _create_goal_analyzer(self) -> Agent:
        """Agent that analyzes and understands the user's goal"""
        return Agent(
            role="Goal Analyst",
            goal="Analyze user goals and extract key requirements, triggers, and outcomes",
            backstory="""You are an expert business process analyst with years of experience
            understanding automation needs. You excel at breaking down complex business goals
            into clear, actionable requirements.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )
    
    def _create_workflow_designer(self) -> Agent:
        """Agent that designs the workflow steps"""
        return Agent(
            role="Workflow Architect",
            goal="Design multi-step workflows that achieve business automation goals",
            backstory="""You are a workflow automation expert who specializes in designing
            efficient, reliable business process automations. You understand how to connect
            different tools and services to create seamless workflows.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )
    
    def _create_blueprint_generator(self) -> Agent:
        """Agent that generates React Flow compatible blueprints"""
        return Agent(
            role="Blueprint Engineer",
            goal="Generate visual blueprints in React Flow format from workflow designs",
            backstory="""You are a technical engineer who specializes in converting workflow
            designs into structured data formats. You understand React Flow node and edge
            structures and create clean, visual representations of workflows.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )
    
    def plan_workflow(self, goal: str, context: Dict[str, Any] = None) -> WorkflowBlueprint:
        """
        Main method to plan a workflow from a natural language goal.
        
        Args:
            goal: Natural language description of the automation goal
            context: Optional context about the user's business/tools
            
        Returns:
            WorkflowBlueprint with React Flow compatible structure
        """
        context = context or {}
        
        # Check if we should use mock mode (when API quota is exceeded or MOCK_MODE is enabled)
        use_mock_mode = os.getenv("MOCK_MODE", "false").lower() == "true"
        
        if use_mock_mode:
            # Generate workflow from simple pattern matching (no API calls)
            return self._generate_mock_workflow(goal)
        
        try:
            # Create tasks for the crew
            analyze_task = Task(
                description=f"""
                Analyze this automation goal: "{goal}"
                
                Extract:
                1. The trigger (what starts the workflow)
                2. The desired outcome
                3. The tools/services needed
                4. Any specific requirements or constraints
                
                Context provided: {str(context)}
                
                Provide a structured analysis of the goal.
                """,
                agent=self.goal_analyzer,
                expected_output="Structured analysis with trigger, outcome, tools, and requirements"
            )
            
            design_task = Task(
                description=f"""
                Based on the goal analysis, design a step-by-step workflow.
                
                For each step, specify:
                - Step name and description
                - Action type (api_call, data_transform, notification, etc.)
                - Tool/service to use (airtable, sendgrid, webhook, etc.)
                - Required parameters
                - Next step in sequence
                
                Make sure the workflow is complete and achieves the goal.
                """,
                agent=self.workflow_designer,
                expected_output="Detailed workflow design with sequential steps"
            )
            
            blueprint_task = Task(
                description="""
                Convert the workflow design into a React Flow blueprint.
                
                Generate:
                1. Nodes array with React Flow node format:
                   - id: unique identifier
                   - type: "default" or "input" or "output"
                   - position: x and y coordinates (numbers)
                   - data: object with label, description, tool, and action_type fields
                
                2. Edges array with React Flow edge format:
                   - id: unique identifier
                   - source: source node id
                   - target: target node id
                   
                3. Ensure nodes are positioned in a readable flow (left to right)
                
                Return the blueprint in JSON format.
                """,
                agent=self.blueprint_generator,
                expected_output="React Flow compatible blueprint JSON"
            )
            
            # Create and run the crew
            crew = Crew(
                agents=[self.goal_analyzer, self.workflow_designer, self.blueprint_generator],
                tasks=[analyze_task, design_task, blueprint_task],
                process=Process.sequential,
                verbose=True
            )
            
            # Execute the crew
            result = crew.kickoff()
            
            # Parse the result and generate the blueprint
            # For now, we'll create a structured response
            # TODO: Parse the CrewAI result more intelligently
            blueprint = self._generate_blueprint_from_result(goal, result)
            
            return blueprint
        except Exception as e:
            error_msg = str(e).lower()
            # If it's a quota/API error, fall back to mock mode
            if "quota" in error_msg or "429" in error_msg or "insufficient" in error_msg:
                print(f"⚠️  API quota exceeded. Falling back to mock mode. Error: {e}")
                return self._generate_mock_workflow(goal)
            # Re-raise other errors
            raise
    
    def _generate_blueprint_from_result(
        self, 
        goal: str, 
        crew_result: Any
    ) -> WorkflowBlueprint:
        """
        Convert CrewAI result into a WorkflowBlueprint.
        
        This is a simplified version - in production, you'd parse the CrewAI
        output more intelligently to extract structured workflow information.
        """
        workflow_id = str(uuid.uuid4())
        
        # For now, generate a sample workflow structure
        # TODO: Parse crew_result to extract actual workflow steps
        steps = [
            WorkflowStep(
                id="step-1",
                name="Trigger: Form Submission",
                description="Detect when a form is submitted",
                action_type="webhook",
                tool="typeform",
                parameters={"form_id": "to_be_configured"},
                next_step_id="step-2"
            ),
            WorkflowStep(
                id="step-2",
                name="Add to Airtable",
                description="Add the form data to Airtable",
                action_type="api_call",
                tool="airtable",
                parameters={"base_id": "to_be_configured", "table": "Leads"},
                next_step_id="step-3"
            ),
            WorkflowStep(
                id="step-3",
                name="Send Welcome Email",
                description="Send a welcome email to the new lead",
                action_type="api_call",
                tool="sendgrid",
                parameters={"template_id": "welcome_email"},
                next_step_id=None
            )
        ]
        
        # Generate React Flow nodes
        nodes = []
        for i, step in enumerate(steps):
            nodes.append({
                "id": step.id,
                "type": "default",
                "position": {"x": i * 300 + 100, "y": 150},
                "data": {
                    "label": step.name,
                    "description": step.description,
                    "tool": step.tool,
                    "action_type": step.action_type
                }
            })
        
        # Mark first and last nodes
        if nodes:
            nodes[0]["type"] = "input"
            nodes[-1]["type"] = "output"
        
        # Generate React Flow edges
        edges = []
        for i, step in enumerate(steps):
            if step.next_step_id:
                edges.append({
                    "id": f"edge-{step.id}-{step.next_step_id}",
                    "source": step.id,
                    "target": step.next_step_id,
                    "type": "smoothstep"
                })
        
        return WorkflowBlueprint(
            workflow_id=workflow_id,
            goal=goal,
            steps=steps,
            edges=edges,
            nodes=nodes
        )
    
    def _generate_mock_workflow(self, goal: str) -> WorkflowBlueprint:
        """
        Generate a mock workflow based on simple pattern matching.
        This is used when API quota is exceeded or MOCK_MODE is enabled.
        """
        goal_lower = goal.lower()
        workflow_id = str(uuid.uuid4())
        steps = []
        
        # Pattern matching to generate relevant workflows
        if "typeform" in goal_lower or "form" in goal_lower:
            if "airtable" in goal_lower:
                steps = [
                    WorkflowStep(
                        id="step-1",
                        name="Trigger: Form Submission",
                        description="Detect when a form is submitted",
                        action_type="webhook",
                        tool="typeform",
                        parameters={"form_id": "to_be_configured"},
                        next_step_id="step-2"
                    ),
                    WorkflowStep(
                        id="step-2",
                        name="Add to Airtable",
                        description="Add the form data to Airtable",
                        action_type="api_call",
                        tool="airtable",
                        parameters={"base_id": "to_be_configured", "table": "Leads"},
                        next_step_id="step-3" if "email" in goal_lower else None
                    )
                ]
                if "email" in goal_lower or "welcome" in goal_lower:
                    steps.append(WorkflowStep(
                        id="step-3",
                        name="Send Welcome Email",
                        description="Send a welcome email to the new lead",
                        action_type="api_call",
                        tool="sendgrid",
                        parameters={"template_id": "welcome_email"},
                        next_step_id=None
                    ))
                    steps[1].next_step_id = "step-3"
        
        elif "email" in goal_lower and "trello" in goal_lower:
            steps = [
                WorkflowStep(
                    id="step-1",
                    name="Trigger: New Email",
                    description="Detect incoming email from customer",
                    action_type="webhook",
                    tool="gmail",
                    parameters={"filter": "from:customer"},
                    next_step_id="step-2"
                ),
                WorkflowStep(
                    id="step-2",
                    name="Create Trello Task",
                    description="Create a new task in Trello board",
                    action_type="api_call",
                    tool="trello",
                    parameters={"board_id": "to_be_configured", "list": "Inbox"},
                    next_step_id=None
                )
            ]
        
        elif "order" in goal_lower or "inventory" in goal_lower:
            steps = [
                WorkflowStep(
                    id="step-1",
                    name="Trigger: New Order",
                    description="Detect when a new order is received",
                    action_type="webhook",
                    tool="shopify",
                    parameters={"event": "order.created"},
                    next_step_id="step-2"
                ),
                WorkflowStep(
                    id="step-2",
                    name="Update Inventory",
                    description="Update inventory spreadsheet",
                    action_type="api_call",
                    tool="google_sheets",
                    parameters={"spreadsheet_id": "to_be_configured"},
                    next_step_id="step-3" if "slack" in goal_lower or "notify" in goal_lower else None
                )
            ]
            if "slack" in goal_lower or "notify" in goal_lower:
                steps.append(WorkflowStep(
                    id="step-3",
                    name="Notify Team",
                    description="Send notification to team on Slack",
                    action_type="api_call",
                    tool="slack",
                    parameters={"channel": "#orders"},
                    next_step_id=None
                ))
                steps[1].next_step_id = "step-3"
        
        elif "crm" in goal_lower or "contact" in goal_lower:
            steps = [
                WorkflowStep(
                    id="step-1",
                    name="Trigger: New Contact",
                    description="Detect when a contact is added to CRM",
                    action_type="webhook",
                    tool="hubspot",
                    parameters={"event": "contact.created"},
                    next_step_id="step-2"
                ),
                WorkflowStep(
                    id="step-2",
                    name="Send Email Sequence",
                    description="Send personalized email sequence",
                    action_type="api_call",
                    tool="mailchimp",
                    parameters={"sequence_id": "welcome_sequence"},
                    next_step_id=None
                )
            ]
        
        elif "newsletter" in goal_lower or "mailchimp" in goal_lower:
            steps = [
                WorkflowStep(
                    id="step-1",
                    name="Trigger: Newsletter Subscription",
                    description="Detect new newsletter subscription",
                    action_type="webhook",
                    tool="website",
                    parameters={"endpoint": "/subscribe"},
                    next_step_id="step-2"
                ),
                WorkflowStep(
                    id="step-2",
                    name="Add to Mailchimp",
                    description="Add subscriber to Mailchimp list",
                    action_type="api_call",
                    tool="mailchimp",
                    parameters={"list_id": "to_be_configured"},
                    next_step_id="step-3"
                ),
                WorkflowStep(
                    id="step-3",
                    name="Send Welcome Series",
                    description="Trigger welcome email series",
                    action_type="api_call",
                    tool="mailchimp",
                    parameters={"automation_id": "welcome_series"},
                    next_step_id=None
                )
            ]
        
        else:
            # Default generic workflow
            steps = [
                WorkflowStep(
                    id="step-1",
                    name="Trigger: Event",
                    description="Detect the trigger event",
                    action_type="webhook",
                    tool="generic",
                    parameters={},
                    next_step_id="step-2"
                ),
                WorkflowStep(
                    id="step-2",
                    name="Process Data",
                    description="Process and transform the data",
                    action_type="data_transform",
                    tool="processor",
                    parameters={},
                    next_step_id="step-3"
                ),
                WorkflowStep(
                    id="step-3",
                    name="Complete Action",
                    description="Complete the desired action",
                    action_type="api_call",
                    tool="integration",
                    parameters={},
                    next_step_id=None
                )
            ]
        
        # Generate React Flow nodes
        nodes = []
        for i, step in enumerate(steps):
            nodes.append({
                "id": step.id,
                "type": "default",
                "position": {"x": i * 300 + 100, "y": 150},
                "data": {
                    "label": step.name,
                    "description": step.description,
                    "tool": step.tool,
                    "action_type": step.action_type
                }
            })
        
        # Mark first and last nodes
        if nodes:
            nodes[0]["type"] = "input"
            nodes[-1]["type"] = "output"
        
        # Generate React Flow edges
        edges = []
        for step in steps:
            if step.next_step_id:
                edges.append({
                    "id": f"edge-{step.id}-{step.next_step_id}",
                    "source": step.id,
                    "target": step.next_step_id,
                    "type": "smoothstep"
                })
        
        return WorkflowBlueprint(
            workflow_id=workflow_id,
            goal=goal,
            steps=steps,
            edges=edges,
            nodes=nodes
        )

