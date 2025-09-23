# langchain-copilot-js

A Node.js backend API for conversational AI using LangChain, Groq LLM, TypeORM, and MongoDB.  
Supports chat memory per session, making it suitable for building AI chatbots with persistent context.

---

## Features

- **Express.js API** with modular routing
- **LangChain** integration with Groq LLM for chat completions
- **MongoDB** via TypeORM for persistent chat memory
- **Session-based memory**: Each conversation is stored and retrieved by session ID
- **Validation middleware** for chat endpoints
- **Environment-based configuration** (`.env`)
- **ESM + TypeScript** with modern build/dev workflow

---

## Endpoints

### `POST /api/chat-copilot`

Send a prompt and receive an AI response, with memory of previous messages in the session.

**Headers:**

- `x-session-id`: (optional) Unique session identifier. If not provided, a new session is created.

**Body:**

```json
{
  "prompt": "Your question here"
}
```

**Response:**

```json
{
  "content": "AI response",
  "usage": {
    /* token usage, etc. */
  }
}
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the root:

```
PORT=3000
GROQ_API_KEY=your-groq-key
CHAT_MODEL=your-groq-model
MONGODB_URI=mongodb://localhost:27017/learning_langchain
MONGODB_DB=learning_langchain
```

### 3. Start MongoDB

You can use Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
```

### 4. Run the server (dev mode)

```bash
npm run dev
```

---

## Project Structure

- `src/app.ts` – Express app entrypoint, MongoDB initialization
- `src/routes/` – API route modules (including `chat-copilot`)
- `src/services/ai-model-api.service.ts` – Handles LLM calls and memory integration
- `src/services/ai-chat-memory.service.ts` – Manages chat history in MongoDB
- `src/database/entities/mongodb/chat-message.entity.ts` – TypeORM entity for chat messages
- `src/database/mongo-datasource.ts` – TypeORM MongoDB datasource config

---

## Tech Stack

- Node.js, TypeScript, ESM
- Express.js
- LangChain + Groq
- MongoDB + TypeORM

**Author:** Sabeel Nasir
