import type { SessionRecord } from '@packages/shared';

interface SessionCardProps {
  session: SessionRecord;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <article style={{ border: '1px solid #aaa', borderRadius: 8, padding: 12 }}>
      <h3>{session.id}</h3>
      <p>{session.prompt}</p>
      <small>Status: {session.status}</small>
    </article>
  );
}
