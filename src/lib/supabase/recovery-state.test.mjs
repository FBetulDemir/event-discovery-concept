import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeRecovery, observeRecovery, getRecoveryState, isRecoveryUser, finishRecovery, dismissRecovery } from './recovery-state.ts';

const values = new Map();
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
} });
globalThis.window = { location: { hash: '', pathname: '/en/konto', search: '' }, history: { state: null, replaceState() {} } };

test('only a verified SDK recovery event enables updates; reload resumes the same user', () => {
  dismissRecovery();
  window.location.hash = '#type=recovery&access_token=untrusted';
  initializeRecovery();
  assert.equal(getRecoveryState(), 'pending');
  assert.equal(isRecoveryUser({ id: 'one' }), false);
  observeRecovery('PASSWORD_RECOVERY', { id: 'one', is_anonymous: false });
  assert.equal(isRecoveryUser({ id: 'one' }), true);
  assert.equal(isRecoveryUser({ id: 'two' }), false);
  window.location.hash = '';
  initializeRecovery();
  observeRecovery('INITIAL_SESSION', { id: 'one', is_anonymous: false });
  assert.equal(getRecoveryState(), 'ready');
  finishRecovery();
  assert.equal(getRecoveryState(), 'complete');
  assert.equal(values.size, 0);
  assert.equal(isRecoveryUser({ id: 'one' }), false);
});

test('failed callbacks do not use an existing account session as recovery authorization', async () => {
  dismissRecovery();
  observeRecovery('PASSWORD_RECOVERY', { id: 'existing-account' });
  window.location.hash = '#type=recovery';
  initializeRecovery();
  observeRecovery('INITIAL_SESSION', { id: 'existing-account' });
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(getRecoveryState(), 'invalid');
  assert.equal(isRecoveryUser({ id: 'existing-account' }), false);
  window.location.hash = '';
  initializeRecovery();
  observeRecovery('INITIAL_SESSION', { id: 'existing-account' });
  assert.equal(getRecoveryState(), 'idle');
});

test('expired links cannot reuse a saved recovery marker', () => {
  dismissRecovery();
  observeRecovery('PASSWORD_RECOVERY', { id: 'one' });
  window.location.hash = '#error=access_denied&error_code=otp_expired';
  initializeRecovery();
  observeRecovery('INITIAL_SESSION', { id: 'one' });
  assert.equal(getRecoveryState(), 'invalid');
  assert.equal(values.size, 0);
});

test('switching users or signing out revokes the recovery UI state', () => {
  dismissRecovery();
  observeRecovery('PASSWORD_RECOVERY', { id: 'one' });
  observeRecovery('SIGNED_IN', { id: 'two' });
  assert.equal(getRecoveryState(), 'idle');
  observeRecovery('PASSWORD_RECOVERY', { id: 'two' });
  observeRecovery('SIGNED_OUT', null);
  assert.equal(getRecoveryState(), 'invalid');
  assert.equal(values.size, 0);
});
