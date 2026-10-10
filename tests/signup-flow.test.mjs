import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source = (await readFile(new URL('../site/signup.js', import.meta.url), 'utf8')).replace(/^import .*;\n/, '');
async function setup(hash, query, authRequest, signupResult = {}) {
  const elements = new Map();
  const document = { querySelector(id) {
    if (!elements.has(id)) elements.set(id, { value: '', hidden: false, dataset: {}, listeners: {}, focus(){}, setCustomValidity(value){this.validation=value;}, reportValidity(){return true;}, addEventListener(name, callback){this.listeners[name]=callback;} });
    return elements.get(id);
  }};
  let cleaned = false;
  const context = vm.createContext({ document, location:{hash,search:query,pathname:'/endoumi-download/signup.html'}, history:{replaceState(){cleaned=true;}}, URLSearchParams, Date, authRequest: async (...args) => { if (hash || query) assert.equal(cleaned,true,'URL cleaned before Auth request'); return authRequest(...args); }, signUp:async()=>signupResult, resend:async()=>({}) });
  vm.runInContext(source,context);
  await new Promise(resolve=>setImmediate(resolve));
  return {elements,cleaned};
}
test('successful email callback verifies Auth user and ends only its local session',async()=>{
  const calls=[];
  const {elements,cleaned}=await setup('#access_token=synthetic-token','',async(path,body,options)=>{calls.push([path,options.token]);return {email_confirmed_at:'2026-10-10'};});
  assert.equal(cleaned,true);
  assert.deepEqual(calls,[['user','synthetic-token'],['logout?scope=local','synthetic-token']]);
  assert.match(elements.get('#account-status').textContent,/이메일 확인이 완료/);
  assert.equal(elements.get('#signup-form').hidden,true);
});
test('a forged callback cannot display successful confirmation',async()=>{
  const {elements}=await setup('#access_token=invalid-token','',async()=>{throw new Error('확인 실패');});
  assert.equal(elements.get('#account-status').dataset.state,'error');
  assert.equal(elements.get('#signup-form').hidden,false);
});
test('expired callback clears URL and permits another signup without calling Auth',async()=>{
  const {elements,cleaned}=await setup('#error=access_denied&error_code=otp_expired','',async()=>{throw new Error('unexpected Auth request');});
  assert.equal(cleaned,true);
  assert.match(elements.get('#account-status').textContent,/만료/);
  assert.equal(elements.get('#signup-form').hidden,false);
});
test('recovery token hashes cannot be consumed as signup confirmation',async()=>{
  const {elements}=await setup('','?token_hash=synthetic&type=recovery',async()=>{throw new Error('unexpected Auth request');});
  assert.match(elements.get('#account-status').textContent,/회원가입 확인 링크/);
});

test('signup without email confirmation completes and clears passwords and local session', async()=> {
  const calls=[];
  const {elements}=await setup('', '', async(path)=>{calls.push(path);return {};}, {access_token:'synthetic-session'});
  elements.get('#password').value='synthetic-password';
  elements.get('#password-confirm').value='synthetic-password';
  await elements.get('#signup-form').listeners.submit({preventDefault(){}});
  assert.match(elements.get('#account-status').textContent,/계정이 생성되었습니다/);
  assert.equal(elements.get('#signup-form').hidden,true);
  assert.equal(elements.get('#password').value,'');
  assert.equal(elements.get('#password-confirm').value,'');
  assert.equal(elements.get('#resend-confirmation').hidden,true);
  assert.deepEqual(calls,['logout?scope=local']);
});
