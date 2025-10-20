/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      // Example translation prompt
      const prompt = "Translate 'Hello world' into French";

      // Call Workers AI Llama 3.3
      const aiResponse = await env.AI.run("@cf/meta/llama-3-3b-instruct", {
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 128,
        temperature: 0.2
      });

      // Parse response — the exact shape may vary slightly
      const translated =
        aiResponse?.output?.[0]?.content ?? aiResponse?.text ?? "No response";

      return new Response(JSON.stringify({ translation: translated }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: (err as Error).message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};