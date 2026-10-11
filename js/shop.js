/* =========================================================
   SCENE. — SHOP THE LOOK
   1) 가로 캐러셀: PC 는 마우스로 잡아 끌기, 트랙패드·터치는 브라우저 기본 가로 스크롤 + Scroll Snap
      자동 슬라이드·무한 루프 없음
   2) Quick View: 카드를 누르면 상세페이지 대신 모달(<dialog>)을 띄움
      X 버튼 · ESC · 바깥 영역 클릭으로 닫기, 열려 있는 동안 배경 스크롤 잠금
   ========================================================= */
(() => {
  const track = document.querySelector(".shop__track");
  const dialog = document.querySelector(".qv");
  if (!track || !dialog) return;

  const cards = Array.from(track.querySelectorAll(".shop-card"));

  // 컨셉 프로젝트 — 가격·브랜드·구매 정보 없음
  const ITEMS = [
    { desc: "짧은 기장의 워싱 레더 재킷. 각진 어깨선과 지퍼 디테일로 밤의 긴장감을 담았습니다." },
    { desc: "시어 메시 롱슬리브와 블랙 브라 톱의 레이어드. 비치는 질감이 네온 아래에서 살아납니다." },
    { desc: "워싱 블랙 데님 카고 팬츠. 와이드 실루엣에 포켓과 스트랩 디테일을 더했습니다." },
    { desc: "무릎까지 오는 블랙 레더 부츠. 뾰족한 앞코와 곧은 라인으로 룩을 마무리합니다." },
  ];

  /* ---------- 1) 마우스 드래그 ---------- */
  const DRAG_THRESHOLD = 5; // 이 거리(px) 이상 움직여야 드래그 — 그 이하는 클릭으로 처리
  let pointerId = null;
  let startX = 0;
  let startLeft = 0;
  let dragging = false;
  let suppressClick = false;
  let settleTimer = 0;

  const maxScroll = () => track.scrollWidth - track.clientWidth;

  // 놓은 위치에서 가장 가까운 카드 정렬 지점 (마지막은 스크롤 끝)
  const nearestSnap = () => {
    const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const max = maxScroll();
    let best = 0;
    cards.forEach((card) => {
      const x = Math.min(card.offsetLeft - pad, max);
      if (Math.abs(x - track.scrollLeft) < Math.abs(best - track.scrollLeft)) best = x;
    });
    return Math.max(0, best);
  };

  const endSettle = () => {
    clearTimeout(settleTimer);
    track.classList.remove("is-settling");
  };

  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return; // 터치·펜은 기본 스크롤 사용
    endSettle();
    pointerId = e.pointerId;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    dragging = false;
  });

  track.addEventListener("pointermove", (e) => {
    if (e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    if (!dragging) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      dragging = true;
      track.classList.add("is-dragging");
      track.setPointerCapture(pointerId); // 카드 밖·섹션 밖으로 나가도 계속 끌림
    }
    track.scrollLeft = startLeft - dx;
  });

  const endDrag = (e) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    if (!dragging) return;
    dragging = false;
    suppressClick = true; // 드래그 끝의 click 으로 모달이 열리지 않게
    setTimeout(() => { suppressClick = false; }, 0);

    // 스냅을 끈 채 가까운 카드로 부드럽게 이동한 뒤 스냅을 다시 켬
    track.classList.add("is-settling");
    track.classList.remove("is-dragging");
    track.scrollTo({ left: nearestSnap(), behavior: "smooth" });
    settleTimer = setTimeout(endSettle, 600);
  };
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("scrollend", () => {
    if (track.classList.contains("is-settling") && !dragging) endSettle();
  });

  /* ---------- 2) Quick View ---------- */
  const root = document.documentElement;
  const qvImg = dialog.querySelector(".qv__img");
  const qvNo = dialog.querySelector(".qv__no");
  const qvName = dialog.querySelector(".qv__name");
  const qvDesc = dialog.querySelector(".qv__desc");
  let opener = null;
  let savedLeft = 0;

  const open = (card) => {
    const item = ITEMS[+card.dataset.item];
    if (!item || dialog.open) return;
    opener = card;
    savedLeft = track.scrollLeft;

    const name = card.querySelector(".shop-card__name").textContent;
    qvImg.src = card.querySelector(".shop-card__img").getAttribute("src");
    qvImg.alt = name;
    qvNo.textContent = card.querySelector(".shop-card__no").textContent;
    qvName.textContent = name;
    qvDesc.textContent = item.desc;

    // 배경 스크롤 잠금 — 스크롤바가 사라지며 레이아웃이 밀리지 않도록 그 너비만큼 보정
    const gap = window.innerWidth - root.clientWidth;
    root.classList.add("is-qv-open");
    if (gap > 0) document.body.style.paddingRight = gap + "px";

    dialog.showModal();
  };

  track.addEventListener("click", (e) => {
    const card = e.target.closest(".shop-card");
    if (!card) return;
    if (suppressClick) return;
    open(card);
  });

  dialog.querySelector(".qv__close").addEventListener("click", () => dialog.close());
  // 바깥(backdrop) 클릭 — 패널이 dialog 를 꽉 채우므로 dialog 자체가 타깃이면 바깥을 누른 것
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  // X 버튼 · ESC · 바깥 클릭 모두 여기로 모임
  dialog.addEventListener("close", () => {
    root.classList.remove("is-qv-open");
    document.body.style.paddingRight = "";
    track.scrollLeft = savedLeft; // 캐러셀 위치 유지
    if (opener) opener.focus({ preventScroll: true });
    opener = null;
  });
})();
