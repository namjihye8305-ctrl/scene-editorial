/* =========================================================
   SCENE. — MOBILE NAV (767px 이하)
   햄버거 버튼으로 HERO / EDITORIAL / RUNWAY 메뉴 열기·닫기
   PC 에서는 버튼과 메뉴가 CSS 로 숨겨져 있어 동작하지 않음
   ========================================================= */
(() => {
  const btn = document.querySelector(".mnav-toggle");
  const nav = document.querySelector("#mnav");
  if (!btn || !nav) return;

  const root = document.documentElement;
  const isOpen = () => btn.getAttribute("aria-expanded") === "true";

  const setOpen = (open) => {
    root.classList.toggle("is-mnav-open", open); // 메뉴가 열린 동안 페이지 스크롤 잠금 (CSS)
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    nav.inert = !open; // 닫혀 있을 때는 메뉴 링크에 포커스가 가지 않게
  };
  setOpen(false);

  btn.addEventListener("click", () => setOpen(!isOpen()));

  // 메뉴 링크를 누르면 닫고 해당 섹션으로 이동 (스크롤 잠금을 먼저 풀어야 이동됨)
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      btn.focus();
    }
  });

  // 열린 채로 화면이 PC 너비가 되면 닫음
  const mq = window.matchMedia("(min-width: 768px)");
  const onChange = (e) => { if (e.matches) setOpen(false); };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
