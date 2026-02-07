const SESSION_KEY = 'soren_guest_session_id';

function generateSessionId(): string {
  const source = Math.random().toString(36).slice(2);
  return `sess_${Date.now()}_${source}`;
}

export function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const created = generateSessionId();
  localStorage.setItem(SESSION_KEY, created);
  return created;
}

export function clearSessionId(): void {
  localStorage.removeItem(SESSION_KEY);
}
