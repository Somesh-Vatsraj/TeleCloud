// Pollinations AI wrapper (free, no key required)

const SYSTEM_PROMPT = `You are TeleCloud Assistant — a helpful, concise AI assistant embedded inside a cloud storage app. 
Answer questions about files, cloud storage, general topics, and help users. Keep replies short and friendly.`;

export async function chatAI(env, prompt, history = []) {
  const endpoint = env.AI_ENDPOINT || 'https://text.pollinations.ai/openai';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map((m) => ({
      role: m.direction === 'out' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: prompt },
  ];

  // Try POST to OpenAI-compatible endpoint
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages,
        temperature: 0.7,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text =
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.text ||
        (typeof data === 'string' ? data : null);
      if (text) return text.trim();
    }
  } catch (e) {
    // fall through to GET fallback
  }

  // Fallback: GET endpoint with prompt in path
  try {
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text) return text.trim();
    }
  } catch (e) {
    // ignore
  }

  return "Sorry, I couldn't reach the AI service right now. Please try again in a moment.";
}

export async function analyzeFile(env, fileInfo) {
  const prompt = `In one short sentence, describe what this file might be: name="${fileInfo.name}", size=${fileInfo.size} bytes, type=${fileInfo.mime || 'unknown'}.`;
  try {
    const res = await chatAI(env, prompt, []);
    return res;
  } catch {
    return `Uploaded ${fileInfo.name}`;
  }
}
