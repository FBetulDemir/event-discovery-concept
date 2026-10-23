import { canResumeRecovery, recoveryFromHash, type RecoveryState } from '../password-recovery.ts';

const STORAGE_KEY = 'ganget:password-recovery-user';
let state: RecoveryState = 'idle';
let recoveryUserId: string | null = null;
const listeners = new Set<() => void>();

function savedUser(): string | null {
  try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function remember(userId: string | null) {
  recoveryUserId = userId;
  try {
    if (userId) sessionStorage.setItem(STORAGE_KEY, userId);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* Recovery still works when storage is unavailable, but cannot survive reload. */ }
}

function setState(next: RecoveryState) {
  state = next;
  listeners.forEach(listener => listener());
}

export const getRecoveryState = () => state;
export const isRecoveryUser = (user: { id: string; is_anonymous?: boolean } | null) => state === 'ready' && canResumeRecovery(recoveryUserId, user);
export const subscribeRecovery = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/** Called before the SDK consumes the callback fragment, including when another component starts auth. */
export function initializeRecovery() {
  if (typeof window === 'undefined') return;
  setState(recoveryFromHash(window.location.hash));
  if (state === 'pending') remember(null);
  if (state === 'invalid') {
    remember(null);
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  }
}

/** No async auth calls here: the SDK holds its auth lock while delivering these events. */
export function observeRecovery(event: string, user: { id: string; is_anonymous?: boolean } | null) {
  if (event === 'PASSWORD_RECOVERY' && user && !user.is_anonymous) {
    remember(user.id);
    setState('ready');
  } else if (event === 'SIGNED_OUT') {
    remember(null);
    setState(state === 'ready' || state === 'pending' ? 'invalid' : 'idle');
  } else if (event === 'INITIAL_SESSION') {
    if (state === 'idle' && canResumeRecovery(savedUser(), user)) {
      recoveryUserId = user!.id;
      setState('ready');
    }
    // Recovery notification may be queued just after INITIAL_SESSION during SDK initialization.
    if (state === 'pending') setTimeout(() => { if (state === 'pending') setState('invalid'); }, 0);
  } else if (event === 'SIGNED_IN' && !canResumeRecovery(savedUser(), user)) {
    remember(null);
    if (state === 'ready') setState('idle');
  }
}

export function finishRecovery() { remember(null); setState('complete'); }
export function dismissRecovery() { remember(null); setState('idle'); }
