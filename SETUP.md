# Quick Setup Guide

## Frontend Environment Setup

The frontend needs the OpenAI API key to be set in its environment variables.

1. **Create `.env.local` file in the `frontend/` directory:**

```bash
cd frontend
touch .env.local
```

2. **Add your OpenAI API key to `frontend/.env.local`:**

```env
OPENAI_API_KEY=your_openai_api_key_here
```

You can copy the API key from `backend/.env` - it's the same key.

3. **Restart your frontend server:**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Why This Is Needed

The frontend's `/api/chat` route needs access to the OpenAI API key to:
- Generate chat responses using the AI SDK
- Handle tool invocations (API key requests, selections)
- Stream responses to the chat interface

## Troubleshooting

If you see "Failed to fetch" or streaming issues:
1. Make sure `frontend/.env.local` exists and has `OPENAI_API_KEY` set
2. Restart the Next.js dev server after creating/modifying `.env.local`
3. Check that the backend is running on `http://localhost:8000`
4. Verify your OpenAI API key is valid and has credits

## Alternative: Use Mock Mode

If you don't want to use OpenAI for the chat (only for workflow generation), you can modify `frontend/app/api/chat/route.ts` to always use mock mode, but the chat features won't work as expected.

