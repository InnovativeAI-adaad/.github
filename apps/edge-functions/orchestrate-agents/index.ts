import type { SessionRecord, OrchestrationRequest } from '@packages/shared';

const inMemorySessions: SessionRecord[] = [];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

async function handlePost(request: Request): Promise<Response> {
  const payload = (await request.json()) as OrchestrationRequest;

  if (!payload.prompt || payload.agents.length === 0) {
    return jsonResponse({ error: 'prompt and at least one agent are required' }, 400);
  }

  const session: SessionRecord = {
    id: crypto.randomUUID(),
    prompt: payload.prompt,
    createdAt: new Date().toISOString(),
    status: 'running',
    agents: payload.agents.map((agentId) => ({
      agentId,
      output: null,
      status: 'queued'
    })),
    consensus: {
      agreementScore: 0,
      divergenceScore: 0,
      confidenceScore: 0
    }
  };

  inMemorySessions.push(session);

  return jsonResponse({ session, message: 'orchestration session started' }, 202);
}

function handleGet(request: Request): Response {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() ?? '';

  const results = q
    ? inMemorySessions.filter((session) =>
        session.prompt.toLowerCase().includes(q) || session.id.toLowerCase().includes(q)
      )
    : inMemorySessions;

  return jsonResponse({ count: results.length, sessions: results });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'POST') {
    return handlePost(request);
  }

  if (request.method === 'GET') {
    return handleGet(request);
  }

  return jsonResponse({ error: 'method not allowed' }, 405);
});
