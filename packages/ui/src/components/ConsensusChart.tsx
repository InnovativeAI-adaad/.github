import type { ConsensusMetrics } from '@packages/shared';

interface ConsensusChartProps {
  metrics: ConsensusMetrics;
}

export function ConsensusChart({ metrics }: ConsensusChartProps) {
  return (
    <div>
      <strong>Consensus Metrics</strong>
      <ul>
        <li>Agreement: {metrics.agreementScore}</li>
        <li>Divergence: {metrics.divergenceScore}</li>
        <li>Confidence: {metrics.confidenceScore}</li>
      </ul>
    </div>
  );
}
