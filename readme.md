<!-- @format -->

# App Store Router for Marketing Analytics

## 1. 프로젝트 개요

이 프로젝트는 앱 마케팅 효율을 높이기 위해 제작된 간단하지만 강력한 데이터 수집 및 리디렉션 시스템입니다. 커뮤니티, 소셜 미디어, 광고 등 다양한 마케팅 채널에 앱을 홍보할 때, 단순한 앱 스토어 링크 대신 이 라우터를 사용함으로써 어떤 채널과 세부 그룹에서, 어떤 기기(iOS/Android)로, 언제 접속했는지에 대한 유의미한 데이터를 수집할 수 있습니다.

수집된 데이터는 향후 마케팅 전략 수립, 광고 예산 최적화, 프로모션 콘텐츠 제작 등에 활용될 수 있습니다.

**앱 다운로드 링크:**

- **Android:** [Google Play](https://play.google.com/store/apps/details?id=com.moneyfitapp.app)
- **iOS:** [App Store](https://apps.apple.com/app/money-fit/id6749416452)

## 2. 주요 기능

- **사용자 기기 자동 감지:** 접속자의 User Agent를 분석하여 Android와 iOS를 자동으로 판별합니다.
- **상세 채널 정보 수집:** URL 경로(`path`)를 `/channel/detail1/detail2/...` 와 같은 계층 구조로 분석하여, 사용자가 어떤 마케팅 채널의 어떤 세부 그룹에서 유입되었는지 정확하게 식별합니다.
- **데이터 로깅:** 유입 채널, 세부 정보, 기기 종류, 접속 시간, User Agent 정보를 서버에 로그로 기록합니다.
- **자동 리디렉션:** 데이터 로깅 후, 사용자를 기기에 맞는 앱 스토어(Google Play/App Store)로 즉시 이동시킵니다.

## 3. 사용된 기술

- **Frontend:** `HTML`, `Vanilla JavaScript`
  - 별도의 프레임워크 없이 순수 웹 기술만으로 구현하여 어떤 환경에서든 가볍고 빠르게 작동하도록 설계했습니다.
- **Backend:** `Node.js`, `Serverless Function`
  - Vercel 플랫폼을 활용하여 별도의 서버 관리 없이 저비용으로 운영 가능한 서버리스 함수로 백엔드를 구현했습니다.
- **Deployment:** `Vercel`
  - GitHub와의 연동을 통해 코드 푸 시 자동으로 빌드 및 배포가 이루어지는 CI/CD 환경을 구축했습니다.

### 사용법

배포 후 생성된 Vercel URL의 경로에 `채널/세부정보1/세부정보2` 형식으로 마케팅 채널 정보를 추가하여 사용합니다.

- **에브리타임 연세대:** `https://<project-name>.vercel.app/everytime/yonsei`
- **블라인드 삼성전자:** `https://<project-name>.vercel.app/blind/samsung`
- **페이스북 여름 캠페인:** `https://<project-name>.vercel.app/facebook/summer-campaign-2024`

### 로그 확인

수집된 데이터는 Vercel 프로젝트 대시보드의 **Functions** 메뉴에서 `api/log`를 선택한 후, **Logs** 탭에서 실시간으로 확인할 수 있습니다.

## 6. 향후 개선 방향

- **데이터베이스 연동:** 현재는 임시 파일에 로그를 기록하고 있으나, 장기적인 데이터 분석을 위해 Vercel KV, Supabase, Firebase 등과 같은 데이터베이스에 로그를 저장하는 방식으로 개선할 수 있습니다.
- **데이터 시각화:** 수집된 로그를 정기적으로 분석하여 간단한 차트나 대시보드로 시각화하는 기능을 추가할 수 있습니다.
- **URL 단축 서비스 연동:** `bit.ly`와 같은 URL 단축 서비스를 API와 연동하여, 채널별로 더 짧고 관리하기 쉬운 URL을 생성하는 기능을 구현할 수 있습니다.

---

데이터 조회 대시보드

1. 전체 조회수
2. 채널 별 조회수
   - 시간대 별 조회수를 나타내고 날짜를 선택할 수 있다.
   - 1시간이 기준이다.
   - 하루 기준이다.
   - 00~24시까지 조회수를 나타내고 하나의 시간 내에 여러 개의 바가 있을 수 있다. 바의 기준은 채널/detail[0]이다. 예를 들어 00~01시 내에 everytime/kgu , everytime/snu ... 여러 주소에서 들어왔다면 , 여러 색의 바들이 함께 있어야한다.
3. 세부 채널 별 조회수
   - ex) evertime 채널의 경우 detail[0]이 학교명이다. 즉, everytime/학교명 별 조회수를 한 눈에 모두 확인할 수 있어야한다. 또한 필터링이 가능하다. 기본값은 '조건없음'으로 총 조회수이다. 2번째 조건은 기기별 조회수이다. device 정보를 활용하여 android/ios 기기를 확인한다.
