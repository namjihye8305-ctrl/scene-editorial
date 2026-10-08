# SCENE.

HERO(1440 × 900, 정적 레이아웃) + EDITORIAL(1440 × 610, GSAP ScrollTrigger pin + scrub 스크롤 인터랙션).
RUNWAY는 Figma에 디자인이 없어 흰색 1440 × 900 영역만 두었고, SHOP은 Figma에 아직 없습니다.

## 규격

- Figma 배너: **1440 × 610px**, `aspect-ratio: 1440 / 610`, 너비 100%
- 모든 좌표·폰트 크기는 1440 × 610 좌표계 값 × `--u`(= 배너 너비 / 1440) → 배너 크기에 비례
- 배너는 스크롤 구간 동안 화면 세로 중앙에 고정됨

## 구조

```
index.html              EDITORIAL 마크업 (이미지 레이어 3 + 텍스트 슬라이드 4)
css/style.css           레이아웃 / 타이포 / 장면별 크롭
js/editorial.js         ScrollTrigger 타임라인
assets/images/          웹용 배경 (seongsu / euljiro / hannam .jpg)
assets/fonts/           Helvetica Now Display (Regular 400, Medium 500, Bold 700) — 상용 폰트, 배포 시 웹폰트 라이선스 확인
```

## 실행

```bash
# 프로젝트 폴더에서
npx serve .
# → http://localhost:3000
```

또는 VS Code **Live Server** 확장 → `index.html` 우클릭 → *Open with Live Server*.

## 조정 포인트

`css/style.css`
- 장면별 사진 크롭: `.ed-layer--*` 의 `--x --y --w` (배너 좌표계 px, 사진 원본 비율 유지)
- 좌측 단색 영역 페이드: `.ed-layer--* .ed-layer__veil`

`js/editorial.js`
- 전체 스크롤 길이: `end: "+=" + window.innerHeight * 3.5`
- 스크롤 추종: `scrub: 0.6` (`true` = 1:1)
