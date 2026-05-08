export type AgentExecutionStatus = 'queued' | 'running' | 'completed' | 'failed';
export type SessionStatus = 'running' | 'completed' | 'failed';

export interface AgentResult {
  agentId: string;
  output: string | null;
  status: AgentExecutionStatus;
}

export interface ConsensusMetrics {
  agreementScore: number;
  divergenceScore: number;
  confidenceScore: number;
}

export interface SessionRecord {
  id: string;
  prompt: string;
  createdAt: string;
  status: SessionStatus;
  agents: AgentResult[];
  consensus: ConsensusMetrics;
}

export interface OrchestrationRequest {
  prompt: string;
  agents: string[];
  metadata?: Record<string, string>;
}
