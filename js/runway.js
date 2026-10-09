/* =========================================================
   SCENE. — RUNWAY
   가운데 세로 영상: 한 번 재생하고 마지막 장면에서 고정
   화면을 벗어났다가 다시 들어오거나, 멈춘 영상을 클릭하면 처음부터 다시 재생
   재생 중 마우스를 올리면 정지 / 떼면 이어서 재생
   터치 기기: 호버 대신 영상을 탭하면 정지 ↔ 이어서 재생
   화면 밖에 있을 때는 재생을 멈춰 리소스 절약
   ========================================================= */
(() => {
  const video = document.querySelector(".runway__video");
  if (!video) return;

  let hovering = false;  // 마우스가 영상 위에 있음
  let tapPaused = false; // 터치로 탭해서 멈춤
  let inView = false;
  let lastPointer = "mouse";

  video.loop = false;

  const sync = () => {
    if (video.ended) return; // 끝났으면 마지막 장면 고정 (play() 하면 처음부터 다시 재생되므로 막음)
    if (hovering || tapPaused || !inView) {
      video.pause();
    } else {
      const p = video.play();
      if (p && p.catch) p.catch(() => {}); // 자동재생이 막히면 poster 이미지가 보임
    }
  };

  // 호버 정지는 마우스에서만 (터치 탭이 mouseenter 로 처리돼 멈춘 채 남는 것 방지)
  video.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    hovering = true;
    sync();
  });
  video.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    hovering = false;
    sync();
  });
  video.addEventListener("pointerdown", (e) => { lastPointer = e.pointerType; });

  // 끝나서 멈춘 뒤 영상을 클릭(탭)하면 처음부터 다시 재생 (마우스가 올라가 있어도 재생)
  // 재생 중 터치로 탭하면 정지 ↔ 이어서 재생
  video.addEventListener("ended", () => video.classList.add("is-ended"));
  video.addEventListener("play", () => video.classList.remove("is-ended"));
  video.addEventListener("click", () => {
    if (video.ended) {
      tapPaused = false;
      video.currentTime = 0;
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
      return;
    }
    if (lastPointer !== "mouse") {
      // 자동재생이 막혀 멈춰 있던 경우(사용자가 멈춘 게 아님) → 탭하면 재생
      if (video.paused && !tapPaused) return sync();
      tapPaused = !tapPaused;
      sync();
    }
  });

  // 음소거 자동재생 조건을 속성으로도 확실히 (일부 모바일 브라우저는 속성값만 확인)
  video.muted = true;
  video.defaultMuted = true;

  // 자동재생이 막힌 환경(저전력 모드, 앱 내 브라우저 등): 화면을 처음 터치하는 순간 재생
  // 영상 자체를 탭한 경우는 위의 탭 정지/재생이 처리하므로 제외. 한 번 재생되면 해제
  const events = ["touchend", "pointerup", "keydown"];
  const kick = (e) => {
    if (e.target === video) return;
    if (inView && video.paused && !video.ended && !hovering && !tapPaused) sync();
  };
  events.forEach((t) => document.addEventListener(t, kick, true));
  video.addEventListener("playing", () => events.forEach((t) => document.removeEventListener(t, kick, true)), { once: true });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) tapPaused = false; // 다시 들어오면 탭 정지 상태는 해제하고 재생
      // 끝까지 본 뒤 화면을 벗어났다가 다시 들어오면 처음부터 다시 재생
      if (inView && video.ended) video.currentTime = 0;
      sync();
    }).observe(video);
  } else {
    inView = true;
    sync();
  }
})();
