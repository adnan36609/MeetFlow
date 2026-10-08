# MeetFlow

**AI-powered meeting assistant for Google Calendar.**

MeetFlow lets users manage their calendar through natural-language conversations instead of traditional scheduling forms.

**[Live Demo](YOUR_LIVE_URL)**

## Features

* Natural-language meeting management
* Google Calendar integration
* AI agent powered by Gemini + Mastra
* Persistent conversation memory
* Conversation threads
* Secure authentication with Descope
* Streaming AI responses
* PostgreSQL-backed persistence
* Responsive Next.js workspace

## Architecture

```text
Next.js + TypeScript
        │
        ▼
Node.js + Express
        │
        ▼
Mastra AI Agent
   ┌────┼────────────┐
   ▼    ▼            ▼
Gemini Memory   Calendar Tools
                    │
                    ▼
             Google Calendar
```

## Tech Stack

| Layer          | Technologies                                 |
| -------------- | -------------------------------------------- |
| Frontend       | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| Backend        | Node.js, Express, TypeScript                 |
| AI             | Mastra, Google Gemini                        |
| Authentication | Descope                                      |
| Database       | PostgreSQL                                   |
| Integration    | Google Calendar API                          |
| Infrastructure | Docker                                       |

## Example

```text
"Schedule a 30-minute meeting with Alex tomorrow at 3 PM."

"What meetings do I have today?"

"What's my next meeting?"
```

MeetFlow interprets the request and uses the appropriate calendar tools while maintaining relevant conversation context.

## Project Structure

```text
MeetFlow/
├── frontend/     # Next.js application
├── backend/      # Express API + AI agent
└── README.md
```

## Getting Started

```bash
git clone https://github.com/adnan36609/MeetFlow.git
cd MeetFlow
```

Install dependencies in `frontend` and `backend`, configure the required environment variables, and start the development servers.
