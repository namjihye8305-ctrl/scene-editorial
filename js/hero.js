/* =========================================================
   SCENE. — HERO
   Figma 프로토타입: hero → After delay 1.5s → Smart Animate(Ease In, 800ms)
   배경이 hero.jpg → hero.mp4(영상, 소리와 함께 반복 재생) 로 한 번 전환됨 (텍스트는 동일)
   ========================================================= */
(() => {
  const hero = document.querySelector("#hero");
  if (!hero) return;

  const DELAY = 1500; // Figma: After delay 1.5s
  const photo = hero.querySelector("img.hero__img");
  const video = hero.querySelector(".hero__video");

  const whenReady = (el, evt, done) =>
    new Promise((r) => {
      if (done()) return r();
      el.addEventListener(evt, r, { once: true });
      el.addEventListener("error", r, { once: true }); // 실패해도 진행 (poster 이미지가 보임)
    });

  // 사운드: 브라우저가 소리 있는 자동재생을 막으면 음소거로 재생하고,
  // 히어로 영역 클릭 / 스피커 버튼 클릭마다 소리 켜기 ↔ 끄기 토글 (아이콘은 상태에 맞춰 바뀜)
  const soundBtn = hero.querySelector(".hero__sound");
  let started = false; // 영상 재생 시작 여부 (1.5초 후)
  const setMuted = (m) => {
    if (!video) return;
    video.muted = m;
    if (soundBtn) {
      soundBtn.setAttribute("aria-pressed", String(!m));
      soundBtn.setAttribute("aria-label", m ? "소리 켜기" : "소리 끄기");
    }
  };
  const playSafe = () => {
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  // 클릭이 사용자 상호작용이 되어 브라우저가 소리 재생을 허용함
  const toggleSound = () => {
    if (!started) return setMuted(false); // 영상 시작 전 클릭은 '소리 켜고 시작'으로 처리
    setMuted(!video.muted);
    if (video.paused) playSafe(); // 음소거 재생까지 막혔던 경우 여기서 재생
  };
  if (video) {
    // 히어로 영역 클릭 → 토글 (GNB 링크·SCROLL·스피커 버튼 클릭은 제외 — 버튼은 아래에서 따로 처리)
    hero.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      toggleSound();
    });
  }
  if (video && soundBtn) soundBtn.addEventListener("click", toggleSound);

  const playWithSound = () => {
    started = true;
    const p = video.play(); // 현재 muted 상태 그대로 시도 (영상 시작 전에 히어로를 클릭했다면 소리 켜진 상태)
    if (!p || !p.catch) return;
    p.catch(() => {
      // 소리 있는 자동재생 차단 → 음소거로 재생, 히어로 클릭 시 소리 켜짐
      setMuted(true);
      playSafe(); // 그래도 막히면 poster 이미지로 전환은 진행
    });
  };
  // 모바일(767px 이하)은 음소거 자동재생으로 시작 — 히어로나 스피커를 누르면 소리 켜짐
  // PC 는 기존대로 소리 켠 채 재생을 먼저 시도
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  setMuted(isMobile);

  if (video && isMobile) {
    // iOS Safari·데이터 절약 모드는 preload 를 무시하고 play() 전까지 영상을 받지 않음
    // → 사진이 보이는 동안(영상은 투명) 음소거로 미리 재생해 첫 프레임을 준비해 둠
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    playSafe();
  }

  // 자동재생이 막힌 환경(저전력 모드, 앱 내 브라우저 등): 화면을 처음 터치하는 순간 재생
  if (video) {
    const events = ["touchend", "pointerup", "keydown"];
    const stop = () => events.forEach((t) => document.removeEventListener(t, kick, true));
    function kick() {
      if (!video.paused) return stop();          // 이미 재생 중이면 더 할 일 없음
      if (started || isMobile) playSafe();        // PC 는 전환 전 미리 재생하지 않음 (기존 동작 유지)
      if (started) stop();
    }
    events.forEach((t) => document.addEventListener(t, kick, true));
  }

  // 영상 첫 프레임이 끝내 준비되지 않아도(모바일 등) 최대 3초 후엔 전환 진행 — 영상 로딩 전엔 poster 가 보임
  const videoReady = video
    ? Promise.race([
        whenReady(video, "loadeddata", () => video.readyState >= 2),
        new Promise((r) => setTimeout(r, 3000)),
      ])
    : Promise.resolve();

  // 첫 사진과 영상 첫 프레임이 준비된 뒤부터 1.5초를 셈 (빈 화면이 페이드인되는 것 방지)
  Promise.all([
    whenReady(photo, "load", () => photo.complete),
    videoReady,
  ]).then(() => {
    setTimeout(() => {
      if (video) {
        video.currentTime = 0;
        if (soundBtn) soundBtn.hidden = false;
        playWithSound();
      }
      hero.classList.add("is-scene-2");
    }, DELAY);
  });
})();
