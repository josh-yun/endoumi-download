import { authRequest, signUp, resend } from './signup-api.js';

const form = document.querySelector('#signup-form');
const submit = document.querySelector('#signup-submit');
const status = document.querySelector('#account-status');
const resendButton = document.querySelector('#resend-confirmation');
const password = document.querySelector('#password');
const confirmation = document.querySelector('#password-confirm');
let pendingEmail = '';
let resendAt = 0;
let busy = false;
function show(message, state = 'success') {
  status.textContent = message;
  status.dataset.state = state;
  status.hidden = false;
  status.focus();
}
function setBusy(value) {
  busy = value;
  submit.disabled = value;
  resendButton.disabled = value;
  submit.textContent = value ? '처리 중…' : '계정 만들기';
}
function checkPasswords() {
  confirmation.setCustomValidity(confirmation.value && password.value !== confirmation.value ? '비밀번호가 일치하지 않습니다.' : '');
}
password.addEventListener('input', checkPasswords);
confirmation.addEventListener('input', checkPasswords);

async function releaseBrowserSession(token) {
  // Verification is a one-time flow. Do not retain the website session.
  if (token) await authRequest('logout?scope=local', {}, { token }).catch(() => {});
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  checkPasswords();
  if (busy || !form.reportValidity()) return;
  setBusy(true);
  status.hidden = true;
  resendButton.hidden = true;
  try {
    const email = document.querySelector('#email').value.trim();
    const data = await signUp(email, password.value);
    await releaseBrowserSession(data.access_token);
    pendingEmail = email;
    password.value = '';
    confirmation.value = '';
    if (data.access_token) {
      form.hidden = true;
      show('계정이 생성되었습니다. 병원 사용 승인 후 엔도우미 앱에서 로그인해 주세요.');
    } else {
      show('확인 이메일을 요청했습니다. 받은 편지함과 스팸함을 확인해 주세요. 이미 가입했다면 엔도우미 앱에서 로그인해 주세요.');
      resendAt = Date.now() + 60000;
      resendButton.hidden = false;
    }
  } catch (error) {
    show(error.name === 'TypeError' || error.name === 'TimeoutError' ? '연결을 확인하고 다시 시도해 주세요.' : error.message, 'error');
  } finally { setBusy(false); }
});
resendButton.addEventListener('click', async () => {
  if (busy || !pendingEmail) return;
  if (Date.now() < resendAt) { show('이메일 재전송은 1분 뒤에 다시 시도해 주세요.', 'error'); return; }
  setBusy(true);
  try {
    await resend(pendingEmail);
    resendAt = Date.now() + 60000;
    show('확인 이메일을 다시 요청했습니다. 받은 편지함과 스팸함을 확인해 주세요.');
  } catch { show('이메일을 다시 보내지 못했습니다. 잠시 후 다시 시도해 주세요.', 'error'); }
  finally { setBusy(false); }
});

async function handleConfirmation() {
  const hash = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  const token = hash.get('access_token');
  const tokenHash = query.get('token_hash');
  const hasError = hash.has('error') || hash.has('error_code') || query.has('error') || query.has('error_code');
  if (!token && !tokenHash && !hasError) return;
  // Remove tokens before any further navigation. Never save them to browser storage.
  history.replaceState(null, '', location.pathname);
  form.hidden = true;
  setBusy(true);
  show('이메일 확인 결과를 확인하고 있습니다.');
  let activeToken = token;
  try {
    if (hasError) throw new Error('이메일 확인 링크가 만료되었거나 사용할 수 없습니다. 가입을 다시 시도하거나 확인 이메일을 다시 요청해 주세요.');
    if (tokenHash) {
      const type = query.get('type');
      if (!['signup', 'email'].includes(type)) throw new Error('회원가입 확인 링크를 사용해 주세요.');
      const verified = await authRequest('verify', { token_hash: tokenHash, type });
      activeToken = verified.access_token;
    }
    if (!activeToken) throw new Error('이메일 확인을 완료하지 못했습니다.');
    const user = await authRequest('user', undefined, { token: activeToken });
    if (!user.email_confirmed_at) throw new Error('이메일 확인을 완료하지 못했습니다.');
    show('이메일 확인이 완료되었습니다. 병원 사용 승인 후 엔도우미 앱에서 같은 계정으로 로그인해 주세요.');
  } catch (error) {
    show(error.message || '이메일 확인을 완료하지 못했습니다.', 'error');
    form.hidden = false;
  } finally {
    await releaseBrowserSession(activeToken);
    setBusy(false);
  }
}
handleConfirmation();
