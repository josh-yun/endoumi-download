// Public browser configuration only. Never put a service-role or AI key here.
export const SUPABASE_URL = 'https://amqhxnpfyqywwvnxfgqu.supabase.co';
export const PUBLISHABLE_KEY = 'sb_publishable_At0euNNRWPt1lkCeuhsrvA_ETqwpDi2';
export const CONFIRMATION_URL = 'https://josh-yun.github.io/endoumi-download/signup.html';

export function authMessage(code, status) {
  if (code === 'signup_disabled') return '현재 신규 가입을 준비하고 있습니다. 잠시 후 다시 시도해 주세요.';
  if (status === 429 || ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(code)) return '요청이 많습니다. 잠시 후 다시 시도해 주세요.';
  if (code === 'email_address_not_authorized' || code === 'unexpected_failure') return '확인 이메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.';
  if (code === 'weak_password') return '더 안전한 비밀번호를 사용해 주세요. 문자, 숫자와 기호를 함께 넣어 주세요.';
  if (code === 'email_address_invalid') return '이메일 주소를 확인해 주세요.';
  if (code === 'user_already_exists') return '이미 가입한 이메일입니다. 엔도우미 앱에서 로그인해 주세요.';
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

export async function authRequest(path, body, { fetchImpl = fetch, token } = {}) {
  const response = await fetchImpl(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20000), cache: 'no-store', credentials: 'omit',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(authMessage(data.code || data.error_code, response.status));
  return data;
}
export function signUp(email, password, options) {
  return authRequest(`signup?redirect_to=${encodeURIComponent(CONFIRMATION_URL)}`, { email, password }, options);
}
export function resend(email, options) {
  return authRequest(`resend?redirect_to=${encodeURIComponent(CONFIRMATION_URL)}`, { type: 'signup', email }, options);
}
