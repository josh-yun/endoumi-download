# 회원가입 메일 발송 연결

회원가입 화면과 Supabase 신규 가입 허용, 이메일 확인, GitHub Pages 확인 URL은 반영되어 있다. SMTP 연결 전에는 일반 사용자 이메일 발송과 실제 확인 완료를 검증한 것으로 처리하지 않는다.

무료 발송은 Resend Free 기준으로 준비한다. 회원가입 인증 메일만 사용하며, 유료 업그레이드나 초과 사용량 과금은 활성화하지 않는다. 발송 한도는 Resend 공식 가격표에서 확인한다.

1. 운영자가 Resend 계정 가입을 완료한다.
2. 운영자가 소유하고 DNS를 수정할 수 있는 도메인을 확인한다. 기존 메일과 발송 평판 분리를 위해 `auth.carenest.co.kr` 같은 하위 도메인을 선택할 수 있다. 사용할 도메인은 운영자와 먼저 확정한다.
3. Resend Domains에서 표시한 DNS 레코드를 해당 도메인의 DNS 관리 화면에 등록하고 Verified 상태를 확인한다. 기존 MX나 다른 서비스의 레코드를 대체하지 않는다.
4. 운영자가 발송 전용 API 키를 만든다. 키를 홈페이지·GitHub·채팅·검증 로그에 넣지 않는다.
5. Supabase Authentication → Emails → SMTP Settings에 다음을 입력한다.
   - Sender email: 인증된 발신 도메인의 주소
   - Sender name: 엔도우미
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: Resend API key (운영자가 직접 입력)
6. 운영자 소유의 테스트 이메일로 홈페이지 가입, 실제 확인 메일 수신, 링크 이동, 앱 로그인까지 검증한다. 사용자 가입은 병원 승인이나 AI 키를 자동 배정하지 않는다.

참고: https://resend.com/docs/send-with-supabase-smtp · https://resend.com/docs/dashboard/domains/introduction · https://resend.com/pricing · https://supabase.com/docs/guides/auth/auth-smtp
