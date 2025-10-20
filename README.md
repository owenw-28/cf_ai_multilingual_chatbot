# 🗣️ AI Multilingual Chatbot

A real-time multilingual chatbot powered by Cloudflare Workers AI, featuring voice input/output, persistent conversation storage, and translation capabilities across 8+ languages.

## ✨ Features

- **🤖 AI-Powered Chat**: Uses Llama 3.1 (8B) for natural conversations in multiple languages
- **🎤 Voice Input**: Speech-to-text using Whisper model for hands-free interaction
- **🔊 Voice Output**: Text-to-speech in the target language for AI responses
- **🌍 Multi-Language Support**: French, Spanish, German, Italian, Portuguese, Chinese, Japanese, Korean
- **💾 Persistent Memory**: Durable Objects store conversation history across sessions
- **🔄 Real-time Translation**: Click any AI message to translate it to English

## 🏗️ Architecture

### Components

1. **LLM (Workers AI)**
   - Llama 3.1 8B Instruct for conversational AI
   - Whisper for speech-to-text transcription

2. **Workflow/Coordination (Cloudflare Workers + Durable Objects)**
   - Workers handle HTTP requests and AI orchestration
   - Durable Objects provide persistent state storage per session

3. **User Input (Chat + Voice)**
   - Text input with send button
   - Microphone recording with WebRTC MediaRecorder API
   - Real-time transcription and response

4. **Memory/State (Durable Objects)**
   - Session-based conversation history
   - Persistent across page refreshes and browser restarts
   - Auto-load on page load, auto-save on each message

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier works!)
- Wrangler CLI installed (`npm install -g wrangler`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/owenw-28/cf_ai_multilingual_chatbot.git
   cd cf_ai_multilingual_chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

### Running Locally

1. **Start the development server**
   ```bash
   npm run dev
   # or
   wrangler dev
   ```

2. **Open your browser**
   - Navigate to `http://localhost:8787`
   - Allow microphone access when prompted (for voice features)

3. **Start chatting!**
   - Select a target language from the dropdown
   - Type a message or click "Start Recording" to speak
   - Click on AI responses to translate them to English
   - Click the 🔊 button to hear AI responses spoken aloud

### Deploying to Production

1. **Deploy to Cloudflare Workers**
   ```bash
   npm run deploy
   # or
   wrangler deploy
   ```

2. **Access your live app**
   - Your app will be available at `https://ai-voice-translator.<your-subdomain>.workers.dev`
   - Share the link with anyone!

## 📖 How to Use

### Text Chat
1. Select your desired language from the dropdown
2. Type your message in the input box (Preferably any language that LLM can understand)
3. Click "Send" or press Enter
4. The AI will respond in your selected language

### Voice Chat
1. Click "🎤 Start Recording"
2. Speak your message clearly (Preferably any language that LLM can understand)
3. Click "⏹️ Stop Recording"
4. Your speech will be transcribed and the AI will respond

### Translation
- Click any AI message to see the English translation
- Click again to revert to the original language

### Text-to-Speech
- Click the "🔊 Speak" button on any AI message
- The message will be read aloud in its original language
- Click "⏹️ Stop" to stop playback

### Reset Conversation
- Click the "Reset Chat" button to clear all history
- This clears both local and server-side storage

## 🛠️ Tech Stack

- **Runtime**: Cloudflare Workers (Typescript)
- **AI Models**: 
  - Llama 3.1 8B Instruct (chat)
  - Whisper (speech-to-text)
- **Storage**: Durable Objects
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **APIs**: Web Speech API, MediaRecorder API

## 📁 Project Structure

```
cf_ai_multilingual_chatbot/
├── src/
│   ├── index.ts              # Main Worker entry point
│   ├── conversation.ts       # Durable Object for storage
├── test/
│   ├── index.spec.ts        # Worker tests
│   └── tsconfig.json        # Test TypeScript config
├── wrangler.jsonc           # Cloudflare Workers config
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vitest.config.mts        # Test configuration
├── README.md                # This file
├── PROMPTS.md              # AI prompts used in development
└── DURABLE_OBJECTS_INTEGRATION.md  # DO integration docs
```

## 🔧 Configuration

### Environment Variables
No environment variables required! AI binding is configured in `wrangler.jsonc`.

### Durable Objects
The app uses Durable Objects for persistent conversation storage:
- Each session gets a unique Durable Object instance
- Session IDs are stored in browser localStorage
- Conversations persist across page refreshes

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📝 License

MIT License - feel free to use this project however you'd like!

## 🤝 Contributing

This project was created as part of a Cloudflare AI assignment. Contributions welcome!

## 🙏 Acknowledgments

- Built with Cloudflare Workers AI
- Uses Llama 3.1 and Whisper models
- Developed with AI assistance (see PROMPTS.md)

---

**Made with ❤️ using Cloudflare Workers AI**

## 🧭 Roadmap / TODOs

- More natural-sounding text-to-speech (evaluate server-side TTS options or higher-quality voices; consider Cloudflare Workers AI TTS when available, or client voice selection/SSML prosody adjustments).
- TTS support for non-Latin scripts (e.g., Chinese, Japanese, Korean). Current Web Speech API voice availability varies by browser/OS and may not speak some scripts reliably.
- Persist user preferences (target language, TTS on/off) across sessions.
- Optional: expose a toggle to choose model size/quality vs speed.

