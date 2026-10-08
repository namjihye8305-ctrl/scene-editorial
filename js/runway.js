/* =========================================================
   SCENE. — RUNWAY
   가운데 세로 영상: 한 번 재생하고 마지막 장면에서 고정
   화면을 벗어났다가 다시 들어오면 처음부터 다시 재생
   재생 중 마우스를 올리면 정지 / 떼면 이어서 재생
   화면 밖에 있을 때는 재생을 멈춰 리소스 절약
   ========================================================= */
(() => {
  const video = document.querySelector(".runway__video");
  if (!video) return;

  let hovering = false;
  let inView = false;

  video.loop = false;

  const sync = () => {
    if (video.ended) return; // 끝났으면 마지막 장면 고정 (play() 하면 처음부터 다시 재생되므로 막음)
    if (hovering || !inView) {
      video.pause();
    } else {
      const p = video.play();
      if (p && p.catch) p.catch(() => {}); // 자동재생이 막히면 poster 이미지가 보임
    }
  };

  video.addEventListener("mouseenter", () => { hovering = true; sync(); });
  video.addEventListener("mouseleave", () => { hovering = false; sync(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      // 끝까지 본 뒤 화면을 벗어났다가 다시 들어오면 처음부터 다시 재생
      if (inView && video.ended) video.currentTime = 0;
      sync();
    }).observe(video);
  } else {
    inView = true;
    sync();
  }
})();
