export function AgentFilterBar() {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <input placeholder="Filter by agent..." aria-label="Filter agents" />
      <select aria-label="Filter by status">
        <option value="all">All statuses</option>
        <option value="running">Running</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  );
}
