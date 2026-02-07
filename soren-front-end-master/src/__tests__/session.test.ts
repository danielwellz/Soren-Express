import { clearSessionId, getSessionId } from '../lib/session';

describe('session utility', () => {
  it('creates and reuses guest session id', () => {
    clearSessionId();
    const first = getSessionId();
    const second = getSessionId();

    expect(first).toMatch(/^sess_/);
    expect(second).toBe(first);
  });
});
