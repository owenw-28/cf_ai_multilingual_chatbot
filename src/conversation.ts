// Durable Object for storing conversation history
export class ConversationHistory {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Get conversation history
    if (request.method === 'GET' && url.pathname === '/history') {
      const history = (await this.state.storage.get('messages')) || [];
      return new Response(JSON.stringify({ history }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add a message to history
    if (request.method === 'POST' && url.pathname === '/add') {
      const { role, text, language } = await request.json() as { role: string; text: string; language: string };
      const history: any[] = (await this.state.storage.get('messages')) || [];
      history.push({ role, text, language, timestamp: Date.now() });
      await this.state.storage.put('messages', history);
      return new Response(JSON.stringify({ success: true, count: history.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Clear conversation history
    if (request.method === 'POST' && url.pathname === '/clear') {
      await this.state.storage.put('messages', []);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
}
