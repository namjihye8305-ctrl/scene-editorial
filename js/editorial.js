/* =========================================================
   SCENE. — EDITORIAL scroll interaction
   GSAP ScrollTrigger pin + scrub
   한 화면을 고정한 채 이미지 레이어 / 텍스트 레이어만 전환
   ========================================================= */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector("#editorial");
  if (!section) return;

  const q = (sel) => section.querySelector(sel);

  const layer = {
    seongsu: q('[data-layer="seongsu"]'),
    euljiro: q('[data-layer="euljiro"]'),
    hannam: q('[data-layer="hannam"]'),
  };
  const img = {
    seongsu: q('[data-layer="seongsu"] .ed-layer__img'),
    euljiro: q('[data-layer="euljiro"] .ed-layer__img'),
    hannam: q('[data-layer="hannam"] .ed-layer__img'),
  };
  const slide = {
    intro: q('[data-slide="intro"]'),
    seongsu: q('[data-slide="seongsu"]'),
    euljiro: q('[data-slide="euljiro"]'),
    hannam: q('[data-slide="hannam"]'),
  };
  const introBlur = q(".js-intro-blur");
  const hannamIn = q(".js-hannam-in");

  const BLUR = "blur(24px)";
  const SHARP = "blur(0px)";

  /* ---------- 초기 상태 ---------- */
  // 레이어는 아래에서 위로 쌓여 있음: seongsu < euljiro < hannam
  gsap.set(layer.seongsu, { autoAlpha: 1 });
  gsap.set([layer.euljiro, layer.hannam], { autoAlpha: 0 });
  gsap.set(Object.values(img), { filter: BLUR, scale: 1.04 });

  gsap.set(slide.intro, { autoAlpha: 1, y: 0, filter: SHARP });
  gsap.set([slide.seongsu, slide.euljiro, slide.hannam], {
    autoAlpha: 0,
    y: 24,
    filter: "blur(8px)",
  });
  gsap.set(introBlur, { filter: "blur(14px)", opacity: 0.45 });

  /* ---------- 텍스트 전환 헬퍼 ---------- */
  const textOut = (el) => ({
    targets: el,
    vars: { autoAlpha: 0, y: -20, filter: "blur(8px)", duration: 0.3, ease: "power1.in" },
  });
  const textIn = (el) => ({
    targets: el,
    vars: { autoAlpha: 1, y: 0, filter: SHARP, duration: 0.35, ease: "power2.out" },
  });

  /* ---------- 타임라인 (총 3.9 units = 3.8 뷰포트, 1 unit ≈ 0.974 뷰포트) ----------
     0.00 – 0.95  STAGE 01 → 02 : 성수 블러 해제, INTRO → SEONGSU IN RAIN
     0.95 – 1.25  hold
     1.25 – 2.25  STAGE 03      : 성수 → 을지로 크로스페이드
     2.25 – 2.50  hold
     2.50 – 3.50  STAGE 04      : 을지로 → 한남 크로스페이드
     3.50 – 3.90  hold → 고정 해제
     3.50 ~       STAGE 05      : 한남 IN 블러 해제 (Figma editorial 5) — 약 절반은 고정 중에 풀림
                  — 고정이 풀린 뒤에도 섹션이 올라가는 동안 계속 풀림 (아래 별도 ScrollTrigger)
  ------------------------------------------------------------ */
  const PIN_VH = 3.8;          // 고정 구간 스크롤 길이 (뷰포트 높이 배수)
  const UNIT = PIN_VH / 3.9;   // 1 unit 당 뷰포트 높이
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      // 1440×610 배너를 화면 세로 중앙에 고정 (화면이 배너보다 낮으면 상단 고정)
      start: () => (section.offsetHeight < window.innerHeight ? "center center" : "top top"),
      end: () => "+=" + window.innerHeight * PIN_VH,
      pin: true,
      scrub: 0.6, // 스크롤을 멈추면 0.6s 이내에 그 상태에서 정지, 역방향도 그대로
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  const add = ({ targets, vars }, at) => tl.to(targets, vars, at);

  // STAGE 01 → 02 : SEOUL IN THREE MOODS → SEONGSU IN RAIN
  tl.to(introBlur, { filter: SHARP, opacity: 1, duration: 0.4, ease: "power1.out" }, 0)
    .to(img.seongsu, { filter: SHARP, scale: 1, duration: 0.95, ease: "power1.out" }, 0);
  add(textOut(slide.intro), 0.5);
  add(textIn(slide.seongsu), 0.7);

  // STAGE 03 : SEONGSU → EULJIRO
  // 위 레이어가 완전히 불투명해진 뒤 아래 레이어를 숨겨서 중간에 배경이 비치지 않게 함
  tl.to(img.seongsu, { filter: "blur(10px)", scale: 1.02, duration: 0.7 }, 1.25)
    .to(layer.euljiro, { autoAlpha: 1, duration: 0.6 }, 1.25)
    .to(img.euljiro, { filter: SHARP, scale: 1, duration: 1, ease: "power1.out" }, 1.25)
    .to(layer.seongsu, { autoAlpha: 0, duration: 0.15 }, 1.9);
  add(textOut(slide.seongsu), 1.3);
  add(textIn(slide.euljiro), 1.65);

  // STAGE 04 : EULJIRO → HANNAM
  tl.to(img.euljiro, { filter: "blur(10px)", scale: 1.02, duration: 0.7 }, 2.5)
    .to(layer.hannam, { autoAlpha: 1, duration: 0.6 }, 2.5)
    .to(img.hannam, { filter: SHARP, scale: 1, duration: 1, ease: "power1.out" }, 2.5)
    .to(layer.euljiro, { autoAlpha: 0, duration: 0.15 }, 3.15);
  add(textOut(slide.euljiro), 2.55);
  add(textIn(slide.hannam), 2.9);

  // 한남이 잠시 유지된 뒤 고정 해제
  tl.to({}, { duration: 0.4 }, 3.5);

  // STAGE 05 : HANNAM IN LIGHT — 가운데 IN 블러 해제
  // 한남이 선명해진 직후(3.5)부터 시작 → 고정 중에 약 절반 풀리고, 고정이 풀린 뒤 섹션이 올라가는 동안 마저 풀림
  const pinST = tl.scrollTrigger;
  gsap.to(hannamIn, {
    filter: SHARP,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: () => pinST.end - window.innerHeight * 0.4 * UNIT,
      end: () => pinST.end + window.innerHeight * 0.4,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  // 이미지 로딩 후 레이아웃 재계산
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
