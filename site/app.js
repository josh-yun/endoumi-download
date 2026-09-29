const downloads = {
  windows: document.querySelector("#windows-download"),
  macos: document.querySelector("#macos-download"),
};
const releaseStatus = document.querySelector("#release-status");

document.documentElement.classList.add("motion-ready");

const platform = /Mac|iPhone|iPad/.test(navigator.platform)
  ? "macos"
  : /Win/.test(navigator.platform)
    ? "windows"
    : null;

if (platform) downloads[platform].classList.add("recommended");

function disableDownloads(message) {
  Object.values(downloads).forEach((link) => {
    link.setAttribute("aria-disabled", "true");
    link.addEventListener("click", (event) => event.preventDefault());
  });
  releaseStatus.textContent = message;
}

fetch("release.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error("release unavailable");
    return response.json();
  })
  .then((release) => {
    if (!release.available) {
      disableDownloads("첫 테스트 설치 파일을 준비하고 있습니다.");
      return;
    }

    downloads.windows.href = "downloads/Endoumi-Windows-x64.exe";
    downloads.macos.href = "downloads/Endoumi-macOS.dmg";
    releaseStatus.textContent = `최신 테스트 버전 ${release.version} · ${release.publishedAt}`;
  })
  .catch(() => {
    releaseStatus.textContent = "릴리스 페이지에서 최신 설치 파일을 확인할 수 있습니다.";
  });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

window.addEventListener(
  "scroll",
  () => {
    const visual = document.querySelector(".hero-visual");
    if (!visual || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const distance = Math.min(window.scrollY * 0.05, 28);
    visual.style.translate = `0 ${distance}px`;
  },
  { passive: true },
);
