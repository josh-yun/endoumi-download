import test from 'node:test';
import assert from 'node:assert/strict';
import { signUp, resend, authRequest, CONFIRMATION_URL, PUBLISHABLE_KEY } from '../site/signup-api.js';

test('signup sends credentials only to Auth and fixes redirect to the deployed page', async () => {
  const result = await signUp('synthetic@example.test', 'synthetic-test-password', { fetchImpl: async (url, options) => {
    assert.equal(new URL(url).origin, 'https://amqhxnpfyqywwvnxfgqu.supabase.co');
    assert.equal(new URL(url).pathname, '/auth/v1/signup');
    assert.equal(new URL(url).searchParams.get('redirect_to'), CONFIRMATION_URL);
    assert.equal(options.headers.apikey, PUBLISHABLE_KEY);
    assert.equal(options.credentials, 'omit');
    assert.deepEqual(JSON.parse(options.body), { email: 'synthetic@example.test', password: 'synthetic-test-password' });
    return Response.json({ user: { id: 'synthetic' }, session: null });
  }});
  assert.equal(result.session, null);
});
test('resend uses signup confirmation and the same fixed redirect', async () => {
  await resend('synthetic@example.test', { fetchImpl: async (url, options) => {
    assert.equal(new URL(url).searchParams.get('redirect_to'), CONFIRMATION_URL);
    assert.deepEqual(JSON.parse(options.body), { type: 'signup', email: 'synthetic@example.test' });
    return Response.json({});
  }});
});
for (const [status, code, expected] of [[429, 'over_email_send_rate_limit', '요청이 많습니다'], [400, 'weak_password', '더 안전한'], [422, 'email_address_not_authorized', '확인 이메일'], [500, 'unexpected_failure', '확인 이메일'], [400, 'signup_disabled', '신규 가입']]) {
  test(`Auth error ${code} does not display raw server data`, async () => {
    await assert.rejects(signUp('synthetic@example.test', 'synthetic-test-password', { fetchImpl: async () => Response.json({ code, message: 'private internal upstream details' }, { status }) }), (error) => error.message.includes(expected) && !error.message.includes('private'));
  });
}
test('confirmation checks authenticated user without storing a session', async () => {
  await authRequest('user', undefined, { token: 'synthetic-session', fetchImpl: async (url, options) => {
    assert.equal(options.method, 'GET');
    assert.equal(options.headers.Authorization, 'Bearer synthetic-session');
    assert.equal(options.cache, 'no-store');
    return Response.json({ email_confirmed_at: '2026-10-10' });
  }});
});
