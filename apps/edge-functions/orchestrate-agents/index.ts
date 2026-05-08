import { createHash } from 'node:crypto';

export type Personality =
  | 'skeptic'
  | 'optimist'
  | 'engineer'
  | 'analyst'
  | 'creative'
  | 'investor'
  | 'philosopher'
  | 'pragmatist';

export type MemoryMode = 'none' | 'shared' | 'isolated';
export type TemperatureStrategy = 'fixed' | 'spread' | 'adaptive';

export interface OrchestrateRequest {
  task: string;
  agentCount: number;
  personalities?: Personality[];
  memoryMode?: MemoryMode;
  temperatureStrategy?: TemperatureStrategy;
  temperature?: number;
  sessionSeed?: string;
}

export interface AgentUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AgentResult {
  agentId: string;
  sessionId: string;
  index: number;
  personality: Personality;
  prompt: string;
  output?: string;
  durationMs: number;
  usage: AgentUsage;
  error?: string;
}

export interface OrchestrateResponse {
  sessionId: string;
  request: {
    task: string;
    agentCount: number;
    memoryMode: MemoryMode;
    temperatureStrategy: TemperatureStrategy;
    personalities: Personality[];
  };
  summary: {
    totalAgents: number;
    succeeded: number;
    failed: number;
    startedAt: string;
    endedAt: string;
    durationMs: number;
    usage: AgentUsage;
  };
  agents: AgentResult[];
}

export interface ModelProvider {
  run(input: {
    sessionId: string;
    agentId: string;
    prompt: string;
    personality: Personality;
    temperature: number;
    memoryMode: MemoryMode;
  }): Promise<{ output: string; usage?: AgentUsage }>;
}

const PERSONALITY_TEMPLATES: Record<Personality, string> = {
  skeptic:
    'You are a skeptical reviewer. Challenge assumptions, identify weak evidence, and surface hidden risks.',
  optimist:
    'You are an optimistic strategist. Emphasize upside, opportunities, and practical reasons this can succeed.',
  engineer:
    'You are a pragmatic software engineer. Focus on architecture, implementation details, constraints, and failure modes.',
  analyst:
    'You are a structured analyst. Break down the problem into dimensions, compare options, and present explicit tradeoffs.',
  creative:
    'You are a creative ideator. Generate novel approaches, unusual combinations, and inventive execution paths.',
  investor:
    'You are an investor mindset evaluator. Focus on ROI, risk-adjusted outcomes, defensibility, and scalability.',
  philosopher:
    'You are a philosopher. Examine first principles, ethics, meaning, and long-term societal implications.',
  pragmatist:
    'You are a pragmatist. Prefer concrete steps, low-friction actions, and decisions that can ship quickly.'
};

const ALLOWED_PERSONALITIES = Object.keys(PERSONALITY_TEMPLATES) as Personality[];

export function validateRequest(payload: unknown): Required<OrchestrateRequest> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Request body must be a JSON object.');
  }

  const input = payload as OrchestrateRequest;
  const task = String(input.task ?? '').trim();
  if (!task) {
    throw new Error('`task` is required and must be non-empty.');
  }

  const agentCount = Number(input.agentCount);
  if (!Number.isInteger(agentCount) || agentCount < 1 || agentCount > 16) {
    throw new Error('`agentCount` must be an integer between 1 and 16.');
  }

  const memoryMode: MemoryMode = input.memoryMode ?? 'isolated';
  if (!['none', 'shared', 'isolated'].includes(memoryMode)) {
    throw new Error('`memoryMode` must be one of: none, shared, isolated.');
  }

  const temperatureStrategy: TemperatureStrategy = input.temperatureStrategy ?? 'spread';
  if (!['fixed', 'spread', 'adaptive'].includes(temperatureStrategy)) {
    throw new Error('`temperatureStrategy` must be one of: fixed, spread, adaptive.');
  }

  const temperature = input.temperature ?? 0.7;
  if (typeof temperature !== 'number' || temperature < 0 || temperature > 2) {
    throw new Error('`temperature` must be a number between 0 and 2.');
  }

  const personalities = (input.personalities?.length
    ? input.personalities
    : ALLOWED_PERSONALITIES.slice(0, agentCount)) as Personality[];

  for (const p of personalities) {
    if (!ALLOWED_PERSONALITIES.includes(p)) {
      throw new Error(`Invalid personality: ${p}`);
    }
  }

  return {
    task,
    agentCount,
    personalities,
    memoryMode,
    temperatureStrategy,
    temperature,
    sessionSeed: input.sessionSeed ?? ''
  };
}

export function buildPrompt(task: string, personality: Personality): string {
  return `${PERSONALITY_TEMPLATES[personality]}\n\nTask:\n${task}\n\nRespond with actionable reasoning and a concise recommendation.`;
}

function deterministicId(prefix: string, value: string): string {
  const hash = createHash('sha256').update(value).digest('hex').slice(0, 16);
  return `${prefix}_${hash}`;
}

function selectTemperature(base: number, strategy: TemperatureStrategy, index: number, total: number): number {
  if (strategy === 'fixed' || total <= 1) return base;
  if (strategy === 'adaptive') {
    return Number(Math.min(1.4, Math.max(0.1, base + (index % 2 === 0 ? -0.1 : 0.1))).toFixed(2));
  }
  const spread = total === 1 ? 0 : (index / (total - 1) - 0.5) * 0.8;
  return Number(Math.min(1.6, Math.max(0.1, base + spread)).toFixed(2));
}

export async function orchestrateAgents(
  payload: unknown,
  provider: ModelProvider
): Promise<OrchestrateResponse> {
  const req = validateRequest(payload);
  const startedAt = new Date();
  const sessionBasis = `${req.task}|${req.agentCount}|${req.memoryMode}|${req.temperatureStrategy}|${req.personalities.join(',')}|${req.sessionSeed}`;
  const sessionId = deterministicId('session', sessionBasis);

  const jobs = Array.from({ length: req.agentCount }).map(async (_, index): Promise<AgentResult> => {
    const personality = req.personalities[index % req.personalities.length];
    const prompt = buildPrompt(req.task, personality);
    const agentId = deterministicId('agent', `${sessionId}|${index}|${personality}`);
    const agentStart = Date.now();
    const temperature = selectTemperature(req.temperature, req.temperatureStrategy, index, req.agentCount);

    try {
      const run = await provider.run({
        sessionId,
        agentId,
        prompt,
        personality,
        temperature,
        memoryMode: req.memoryMode
      });

      return {
        agentId,
        sessionId,
        index,
        personality,
        prompt,
        output: run.output,
        durationMs: Date.now() - agentStart,
        usage: run.usage ?? {}
      };
    } catch (error) {
      return {
        agentId,
        sessionId,
        index,
        personality,
        prompt,
        durationMs: Date.now() - agentStart,
        usage: {},
        error: error instanceof Error ? error.message : 'Unknown agent execution error.'
      };
    }
  });

  const agents = await Promise.all(jobs);
  const endedAt = new Date();

  const usage = agents.reduce<AgentUsage>(
    (acc, agent) => {
      acc.promptTokens = (acc.promptTokens ?? 0) + (agent.usage.promptTokens ?? 0);
      acc.completionTokens = (acc.completionTokens ?? 0) + (agent.usage.completionTokens ?? 0);
      acc.totalTokens = (acc.totalTokens ?? 0) + (agent.usage.totalTokens ?? 0);
      return acc;
    },
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  );

  const failed = agents.filter((a) => a.error).length;

  return {
    sessionId,
    request: {
      task: req.task,
      agentCount: req.agentCount,
      memoryMode: req.memoryMode,
      temperatureStrategy: req.temperatureStrategy,
      personalities: req.personalities
    },
    summary: {
      totalAgents: req.agentCount,
      succeeded: req.agentCount - failed,
      failed,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationMs: endedAt.getTime() - startedAt.getTime(),
      usage
    },
    agents
  };
}
