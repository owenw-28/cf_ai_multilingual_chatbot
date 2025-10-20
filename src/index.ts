/**
 * AI Multilingual Chatbot - Cloudflare Workers
 * 
 * Features:
 * - Chatbot in any language, with session memory
 * - Durable Objects for persistent conversation storage
 */

// Export Durable Object
export { ConversationHistory } from './conversation';

// HTML frontend served at root
const HTML_INTERFACE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Multilingual Chatbot</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .container { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    h1 { color: #333; text-align: center; margin-bottom: 30px; }
    .controls { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
    #recordBtn, #sendBtn { background: #667eea; color: white; border: none; padding: 15px 30px; font-size: 16px; border-radius: 10px; cursor: pointer; transition: all 0.3s; flex: 1; }
    #recordBtn:hover, #sendBtn:hover { background: #5568d3; transform: translateY(-2px); }
    #recordBtn.recording { background: #ef4444; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    select { padding: 15px; font-size: 16px; border-radius: 10px; border: 2px solid #e5e7eb; flex: 1; }
    input[type="text"] { flex:2; padding:15px; font-size:16px; border-radius:10px; border:2px solid #e5e7eb; }
    .chat { margin-bottom: 30px; }
    .msg { background: #f9fafb; border-radius: 10px; padding: 20px; margin: 10px 0; border-left: 4px solid #667eea; }
    .msg.user { border-left-color: #ef4444; }
    .msg h3 { margin-top: 0; color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .msg.user h3 { color: #ef4444; }
    .msg p { margin: 10px 0 0 0; font-size: 18px; color: #333; line-height: 1.6; }
    .msg.ai { position: relative; cursor: pointer; transition: transform 0.2s; }
    .msg.ai:hover { transform: translateY(-2px); }
    .msg.ai.translating { opacity: 0.6; }
    .speak-btn { background: #10b981; color: white; border: none; padding: 8px 16px; font-size: 14px; border-radius: 6px; cursor: pointer; margin-top: 10px; transition: all 0.3s; }
    .speak-btn:hover { background: #059669; transform: scale(1.05); }
    .speak-btn.speaking { background: #ef4444; animation: pulse 1s infinite; }
    .status { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
    .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f4f6; border-radius: 50%; border-top-color: #667eea; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <h1>🗣️ AI Multilingual Chatbot</h1>
    <div class="controls">
      <button id="recordBtn">🎤 Start Recording</button>
      <select id="targetLang">
        <option value="French">French</option>
        <option value="Spanish">Spanish</option>
        <option value="German">German</option>
        <option value="Italian">Italian</option>
        <option value="Portuguese">Portuguese</option>
        <option value="Chinese">Chinese</option>
        <option value="Japanese">Japanese</option>
        <option value="Korean">Korean</option>
      </select>
    </div>
    <div class="controls">
      <input id="textInput" type="text" placeholder="Type your message..." />
      <button id="sendBtn">Send</button>
      <button id="resetBtn" style="background:#ef4444; color:white; border:none; padding:15px 30px; font-size:16px; border-radius:10px; cursor:pointer; margin-left:10px;">Reset Chat</button>
    </div>
    <div id="chat" class="chat"></div>
    <div class="status" id="status">Start a conversation by speaking or typing!</div>
  </div>
  <script>
    const recordBtn = document.getElementById('recordBtn');
    const targetLang = document.getElementById('targetLang');
    const status = document.getElementById('status');
    const chatDiv = document.getElementById('chat');
    const textInput = document.getElementById('textInput');
    const sendBtn = document.getElementById('sendBtn');
    const resetBtn = document.getElementById('resetBtn');

    let mediaRecorder, audioChunks = [];
    let conversationHistory = [];
    let speechSynthesis = window.speechSynthesis;
    let currentUtterance = null;
    let sessionId = localStorage.getItem('sessionId') || 'session-' + Math.random().toString(36).substring(7);
    localStorage.setItem('sessionId', sessionId);
    
    // Load conversation history from server on page load
    async function loadHistory() {
      try {
        const response = await fetch('/api/history?sessionId=' + sessionId);
        const data = await response.json();
        if (data.history && Array.isArray(data.history)) {
          conversationHistory = data.history;
          renderChat();
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    }
    
    loadHistory();
    
    function getLanguageCode(language) {
      const langMap = {
        'French': 'fr-FR',
        'Spanish': 'es-ES',
        'German': 'de-DE',
        'Italian': 'it-IT',
        'Portuguese': 'pt-PT',
        'Chinese': 'zh-CN',
        'Japanese': 'ja-JP',
        'Korean': 'ko-KR'
      };
      return langMap[language] || 'en-US';
    }

    function renderChat() {
      let html = '';
      for (let i = 0; i < conversationHistory.length; i++) {
        const msg = conversationHistory[i];
        html += '<div class="msg ' + msg.role + '" data-index="' + i + '"><h3>' + (msg.role === 'user' ? 'You' : 'AI (' + msg.language + ')') + ':</h3><p id="msg-text-' + i + '">' + msg.text + '</p>';
        if (msg.role === 'ai') {
          html += '<button class="speak-btn" data-index="' + i + '">🔊 Speak</button>';
        }
        html += '</div>';
      }
      chatDiv.innerHTML = html;
      
      // Add speak button event listeners
      document.querySelectorAll('.speak-btn').forEach(function(btn) {
        btn.onclick = function(e) {
          e.stopPropagation();
          const idx = btn.getAttribute('data-index');
          const msg = conversationHistory[idx];
          if (!msg || !msg.text) return;
          
          if (currentUtterance && speechSynthesis.speaking) {
            speechSynthesis.cancel();
            btn.textContent = '🔊 Speak';
            btn.classList.remove('speaking');
            currentUtterance = null;
          } else {
            const utterance = new SpeechSynthesisUtterance(msg.text);
            utterance.lang = getLanguageCode(msg.language);
            utterance.onend = function() {
              btn.textContent = '🔊 Speak';
              btn.classList.remove('speaking');
              currentUtterance = null;
            };
            btn.textContent = '⏹️ Stop';
            btn.classList.add('speaking');
            currentUtterance = utterance;
            speechSynthesis.speak(utterance);
          }
        };
      });
      
      // Add click event for AI messages to toggle translation
      document.querySelectorAll('.msg.ai').forEach(function(el) {
        el.onclick = async function(e) {
          if (e.target.classList.contains('speak-btn')) return;
          const idx = el.getAttribute('data-index');
          const msg = conversationHistory[idx];
          const msgTextEl = document.getElementById('msg-text-' + idx);
          if (!msg || !msg.text || !msgTextEl) return;
          
          // Toggle between original and English
          if (el.classList.contains('showing-english')) {
            // Revert to original
            msgTextEl.textContent = msg.text;
            el.classList.remove('showing-english');
            el.classList.remove('translating');
          } else {
            // Translate to English
            el.classList.add('translating');
            msgTextEl.textContent = 'Translating...';
            try {
              const response = await fetch('/api/translate-to-english', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: msg.text })
              });
              const data = await response.json();
              if (data.translation) {
                msgTextEl.textContent = data.translation;
                el.classList.add('showing-english');
              } else {
                msgTextEl.textContent = msg.text;
              }
            } catch {
              msgTextEl.textContent = msg.text;
            }
            el.classList.remove('translating');
          }
        };
      });
    }

    function addMessage(role, text, language) {
      conversationHistory.push({ role, text, language });
      renderChat();
      // Save to Durable Object
      fetch('/api/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, role, text, language })
      }).catch(err => console.error('Failed to save message:', err));
    }

    sendBtn.onclick = async () => {
      const text = textInput.value.trim();
      if (!text) {
        status.textContent = '❌ Please enter a message.';
        return;
      }
      status.innerHTML = '<div class="loading"></div> Sending...';
      textInput.value = '';
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLanguage: targetLang.value, history: conversationHistory })
        });
        const data = await response.json();
        if (data.error) {
          status.textContent = '❌ Error: ' + data.error;
        } else {
          addMessage('user', text, '');
          addMessage('ai', data.reply, targetLang.value);
          status.textContent = '✅ Reply received!';
        }
      } catch (err) {
        status.textContent = '❌ Error: ' + err.message;
      }
    };

    recordBtn.onclick = async () => {
      if (!mediaRecorder) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);

          mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
          mediaRecorder.onstop = async () => {
            status.innerHTML = '<div class="loading"></div> Processing...';
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = [];

            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('targetLanguage', targetLang.value);
            formData.append('history', JSON.stringify(conversationHistory));

            try {
              const response = await fetch('/api/chat-audio', {
                method: 'POST',
                body: formData
              });
              const data = await response.json();
              
              if (data.error) {
                status.textContent = '❌ Error: ' + data.error;
              } else {
                addMessage('user', data.original, '');
                addMessage('ai', data.reply, targetLang.value);
                status.textContent = '✅ Reply received!';
              }
            } catch (err) {
              status.textContent = '❌ Error: ' + err.message;
            }
          };
        } catch (err) {
          status.textContent = '❌ Microphone access denied';
          return;
        }
      }

      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        recordBtn.textContent = "🎤 Start Recording";
        recordBtn.classList.remove('recording');
      } else {
        mediaRecorder.start();
        recordBtn.textContent = "⏹️ Stop Recording";
        recordBtn.classList.add('recording');
        status.textContent = '🎙️ Recording... Speak now!';
      }
    };

    resetBtn.onclick = () => {
      conversationHistory = [];
      renderChat();
      status.textContent = 'Chat reset. Start a new conversation!';
      // Clear on server
      fetch('/api/clear-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }).catch(err => console.error('Failed to clear history:', err));
    };
  </script>
</body>
</html>
`;

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      const url = new URL(request.url);
      
      // CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Serve HTML interface at root
      if (request.method === 'GET' && url.pathname === '/') {
        return new Response(HTML_INTERFACE, {
          headers: { 'Content-Type': 'text/html' }
        });
      }

      // Get conversation history from Durable Object
      if (request.method === 'GET' && url.pathname === '/api/history') {
        const sessionId = url.searchParams.get('sessionId');
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'No sessionId provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        
        const id = env.CONVERSATION_HISTORY.idFromName(sessionId);
        const stub = env.CONVERSATION_HISTORY.get(id);
        const response = await stub.fetch(new Request('http://do/history'));
        return new Response(await response.text(), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Save message to Durable Object
      if (request.method === 'POST' && url.pathname === '/api/save-message') {
        const { sessionId, role, text, language } = await request.json() as any;
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'No sessionId provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        
        const id = env.CONVERSATION_HISTORY.idFromName(sessionId);
        const stub = env.CONVERSATION_HISTORY.get(id);
        await stub.fetch(new Request('http://do/add', {
          method: 'POST',
          body: JSON.stringify({ role, text, language }),
          headers: { 'Content-Type': 'application/json' }
        }));
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Clear conversation history in Durable Object
      if (request.method === 'POST' && url.pathname === '/api/clear-history') {
        const { sessionId } = await request.json() as any;
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'No sessionId provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        
        const id = env.CONVERSATION_HISTORY.idFromName(sessionId);
        const stub = env.CONVERSATION_HISTORY.get(id);
        await stub.fetch(new Request('http://do/clear', { method: 'POST' }));
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Chatbot: text
      if (request.method === 'POST' && url.pathname === '/api/chat') {
        const body = await request.json() as { text?: string; targetLanguage?: string; history?: any[] };
        const text = body.text;
        const targetLanguage = body.targetLanguage || 'French';
        const history = Array.isArray(body.history) ? body.history : [];

        if (!text) {
          return new Response(
            JSON.stringify({ error: 'No text provided' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // Build conversation context
        let context = '';
        for (const msg of history) {
          if (msg.role === 'user') {
            context += `User: ${msg.text}\n`;
          } else if (msg.role === 'ai') {
            context += `AI: ${msg.text}\n`;
          }
        }
        
        const prompt = `You are a helpful AI assistant. Respond naturally in ${targetLanguage}. Do not repeat yourself.\n\nConversation:\n${context}User: ${text}\nAI:`;
        const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 256,
          temperature: 0.7
        });
        const reply = aiResponse?.response || 'No reply';

        return new Response(
          JSON.stringify({ reply, targetLanguage }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Chatbot: audio
      if (request.method === 'POST' && url.pathname === '/api/chat-audio') {
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File;
        const targetLanguage = formData.get("targetLanguage") as string || "French";
        const historyRaw = formData.get("history") as string;
        const history = historyRaw ? JSON.parse(historyRaw) : [];

        if (!audioFile) {
          return new Response(
            JSON.stringify({ error: "No audio file provided" }), 
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const arrayBuffer = await audioFile.arrayBuffer();

        // Step 1: Speech-to-Text using Whisper
        const sttResponse = await env.AI.run("@cf/openai/whisper", {
          audio: [...new Uint8Array(arrayBuffer)],
        });
        
        const inputText = sttResponse?.text || sttResponse?.result?.text || "No transcription";

        if (!inputText || inputText === "No transcription") {
          return new Response(
            JSON.stringify({ error: "Failed to transcribe audio" }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // Build conversation context
        let context = '';
        for (const msg of history) {
          if (msg.role === 'user') {
            context += `User: ${msg.text}\n`;
          } else if (msg.role === 'ai') {
            context += `AI: ${msg.text}\n`;
          }
        }
        
        const prompt = `You are a helpful AI assistant. Respond naturally in ${targetLanguage}. Do not repeat yourself.\n\nConversation:\n${context}User: ${inputText}\nAI:`;
        const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 256,
          temperature: 0.7
        });
        const reply = aiResponse?.response || 'No reply';

        return new Response(
          JSON.stringify({ original: inputText, reply, targetLanguage }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Translate to English endpoint
      if (request.method === 'POST' && url.pathname === '/api/translate-to-english') {
        const body = await request.json() as { text?: string };
        const text = body.text;
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'No text provided' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        const prompt = `Translate the following text to English. Only provide the translation, nothing else:\n\n${text}`;
        const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 256,
          temperature: 0.2
        });
        const translation = aiResponse?.response || 'Translation failed';
        return new Response(
          JSON.stringify({ translation }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Fallback: Show available endpoints
      return new Response(
        JSON.stringify({ 
          message: "AI Multilingual Chatbot API",
          endpoints: {
            "GET /": "Web interface",
            "POST /api/chat": "Send message (typed)",
            "POST /api/chat-audio": "Send message (audio)"
          }
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: (err as Error).message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};