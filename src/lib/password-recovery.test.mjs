import assert from 'node:assert/strict';
import test from 'node:test';
import { recoveryFromHash, recoveryRedirect, canResumeRecovery, validateNewPassword } from './password-recovery.ts';

test('URL markers request verification but never authorize password updates', () => {
  assert.equal(recoveryFromHash('#type=recovery&access_token=untrusted'), 'pending');
  assert.equal(recoveryFromHash('#type=signup&access_token=untrusted'), 'idle');
  assert.equal(recoveryFromHash('#error=access_denied&error_code=otp_expired&error_description=untrusted'), 'invalid');
  assert.equal(recoveryFromHash(''), 'idle');
});

test('recovery redirects stay on the current site and preserve the supported locale', () => {
  assert.equal(recoveryRedirect('https://example.com', 'en'), 'https://example.com/en/konto');
  assert.equal(recoveryRedirect('https://example.com', 'sv'), 'https://example.com/konto');
  assert.equal(recoveryRedirect('http://localhost:3000', 'en'), 'http://localhost:3000/en/konto');
  assert.equal(recoveryRedirect('https://example.com', '//other.example'), 'https://example.com/konto');
});

test('a saved recovery flow belongs only to the same authenticated account', () => {
  assert.equal(canResumeRecovery('one', { id: 'one', is_anonymous: false }), true);
  assert.equal(canResumeRecovery('one', { id: 'two' }), false);
  assert.equal(canResumeRecovery('one', { id: 'one', is_anonymous: true }), false);
  assert.equal(canResumeRecovery('one', null), false);
  assert.equal(canResumeRecovery(null, { id: 'one' }), false);
});

test('new passwords require minimum length and exact confirmation', () => {
  assert.equal(validateNewPassword('short', 'short', 8), 'weak_password');
  assert.equal(validateNewPassword('long-enough', 'different', 8), 'mismatch');
  assert.equal(validateNewPassword('long-enough', 'long-enough ', 8), 'mismatch');
  assert.equal(validateNewPassword('long-enough', 'long-enough', 8), null);
});
