import React from 'react';
import ReactDOM from 'react-dom/client';
import { DashboardPanel, SessionCard, AgentFilterBar } from '@packages/ui';
import type { SessionRecord } from '@packages/shared';

const sampleSession: SessionRecord = {
  id: 'sess_001',
  prompt: 'Compare three retrieval strategies for support-chat triage.',
  createdAt: new Date().toISOString(),
  status: 'running',
  consensus: {
    agreementScore: 0.74,
    divergenceScore: 0.22,
    confidenceScore: 0.87
  },
  agents: []
};

function App() {
  return (
    <DashboardPanel title="Orchestration Sessions">
      <AgentFilterBar />
      <SessionCard session={sampleSession} />
    </DashboardPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
