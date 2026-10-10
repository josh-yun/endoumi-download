# 엔도우미 제품 홈페이지

엔도우미 제품 소개와 설치 파일, 제품 소개서를 제공하는 GitHub Pages 저장소입니다.

- 제품 홈페이지: https://josh-yun.github.io/endoumi-download/
- 다운로드 페이지: https://josh-yun.github.io/endoumi-download/download.html
- 설치 파일: [릴리스 목록](https://github.com/josh-yun/endoumi-download/releases)
- 지원 운영체제: Windows 10/11, macOS

이 저장소에는 엔도우미 제품 소스 코드, API 키, 환자 정보 또는 병원 데이터가 포함되지 않습니다.
현재 배포본은 테스트용이며 실제 진료에 적용하기 전에 병원 내부 검증이 필요합니다.

## 회원가입

- 가입 페이지: https://josh-yun.github.io/endoumi-download/signup.html
- 이메일/비밀번호로 Supabase Auth에 가입하고 이메일 확인 후 앱에서 로그인합니다.
- 신규 가입은 병원 사용 권한이나 AI 키를 자동 배정하지 않습니다. 기존 관리자 승인 절차를 사용합니다.
- 홈페이지에는 공개 publishable key만 사용합니다. 비밀번호·인증 토큰을 로그, localStorage, sessionStorage에 기록하지 않습니다. 확인 링크의 인증 정보는 주소에서 즉시 제거하고 웹 세션은 종료합니다.
- Supabase 설정: 신규 가입 허용, 이메일 확인 켜기, Site URL 및 Redirect URL을 위 가입 페이지로 설정.
- 일반 사용자에게 확인 메일을 발송하려면 Supabase Authentication → Emails → SMTP Settings에 사용자 지정 SMTP를 연결해야 합니다. 기본 발송은 조직 구성원 이메일과 제한된 발송량만 지원합니다.
- 연동 검증: `node --test tests/signup.test.mjs`. 실제 메일 수신·확인 완료는 SMTP 연결 및 사용자 직접 가입 후 별도 확인합니다.
