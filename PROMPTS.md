# AI Prompts Used in Development

This document contains all major AI prompts used to develop this project, organized chronologically.


## Feature Development

### 1. Speech-to-Text Integration
**Prompt**: "I want you to now add speech-to-text: Step 4 — Add Speech-to-Text (STT). We need to capture user voice input and convert it to text so that Llama can translate it. Option 1: Use Cloudflare's Whisper model via Workers AI. Whisper can take audio data (Blob/ArrayBuffer) and return text. You'll POST audio from the frontend to your Worker."

**Context**: Adding voice input capability

**Result**: Integrated Whisper model for speech-to-text, created FormData endpoint for audio upload

---

### 2. Architecture Change to Chatbot
**Prompt**: "Now I want to change the idea from it being a translator to a conversation so that you can have conversations in a different language. I want you to include state or memory"

**Context**: Pivoting from simple translation to conversational AI

**Result**: 
- Added conversation history array
- Implemented context building for AI prompts
- Created message rendering system

---

### 3. User Experience Improvements

#### Text Input Option
**Prompt**: "Give the user the option to type as well"

**Result**: Added text input field and send button alongside voice recording

#### Click-to-Translate Feature
**Prompt**: "Can you have it so that when I hover my mouse over the comments, it translates it to english"

**Follow-up**: "Instead of the tooltip I want to replace the text of the chat to be english and reverted back when the mouse is off. And instead of when hovering the mouse over I want it to be when the user clicks the box"

**Result**: Implemented click-to-toggle translation feature with API endpoint

---

### 4. Text-to-Speech
**Prompt**: "I want to add text-to-speech to the chatbot responses as well"

**Result**: 
- Added Web Speech API integration
- Created speaker buttons for each AI message
- Implemented language code mapping for proper pronunciation

---

### 5. Conversation Management

#### Reset Functionality
**Prompt**: "I want you to add an option to reset the chat"

**Result**: Added Reset Chat button that clears conversation history

---

## Advanced Features

### 6. Durable Objects Integration
**Prompt**: "Add durable objects"

**Context**: Need for persistent conversation storage to meet assignment requirements

**Result**: 
- Created ConversationHistory Durable Object class
- Added session ID management with localStorage
- Implemented auto-save and auto-load functionality
- Added three API endpoints for DO interaction
- Updated wrangler.jsonc with DO bindings and migrations

---

### 7. Repository Setup
**Prompt**: "Can you help me with this: your repository name must be prefixed with cf_ai_, must include a README.md file with project documentation and clear running instructions to try out components (either locally or via deployed link). AI-assisted coding is encouraged, but you must include AI prompts used in PROMPTS.md"

**Result**: 
- Created comprehensive README.md
- Created this PROMPTS.md file
- Documented all features and setup instructions

---

### 1. State Management
- **Initial**: Client-side only (JavaScript array)
- **Intermediate**: Conversation history with context
- **Final**: Durable Objects for persistent storage
- **Reasoning**: Meet assignment requirements, improve UX

### 2. User Interface Evolution
- **Initial**: Voice-only translator
- **Evolution 1**: Added text input option
- **Evolution 2**: Added translation toggle feature
- **Evolution 3**: Added TTS for AI responses
- **Final**: Full-featured multilingual chatbot
- **Reasoning**: Comprehensive user experience

### 3. Prompt Engineering
- **Initial**: Simple "Translate to X"
- **Intermediate**: "Continue this conversation in X"
- **Final**: "You are a helpful AI assistant. Respond naturally in X. Do not repeat yourself."
- **Temperature**: 0.2 → 0.7 for more natural responses
- **Reasoning**: Better conversation quality, avoid repetition

### 4. Audio Handling
- **Format**: WebM audio blobs
- **Processing**: Uint8Array conversion for Whisper
- **Reasoning**: Browser compatibility and API requirements

---

## AI Tools Used

- **Primary**: GitHub Copilot (VS Code extension)
- **Context**: All prompts were conversational, building on previous context
- **Approach**: Iterative development with immediate testing and refinement
