# Alan Frontend

Next.js React frontend for the Alan AI-powered automation platform.

## Architecture

- **Next.js 14**: React framework with App Router
- **React Flow**: Read-only flowchart visualization
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── WorkflowChat.tsx    # Chat interface for goal input
│   └── WorkflowBlueprint.tsx # React Flow blueprint viewer
├── types/
│   └── workflow.ts         # TypeScript type definitions
└── lib/
    └── utils.ts            # Utility functions
```

## Features

1. **Goal Input**: Natural language textarea for describing automation goals
2. **Blueprint Viewer**: Read-only React Flow visualization of generated workflows
3. **Approval System**: Approve/reject buttons for workflow confirmation

## Development

1. Install dependencies: `npm install`
2. Set up `.env.local` with `NEXT_PUBLIC_API_URL` (optional)
3. Run: `npm run dev`

## Next Steps

- [ ] Integrate Vercel AI SDK for streaming responses
- [ ] Add workflow editing capabilities
- [ ] Implement workflow execution status tracking
- [ ] Add user authentication

