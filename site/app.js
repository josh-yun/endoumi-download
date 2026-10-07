const menuButton = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuButton && primaryNav) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.querySelector(".sr-only").textContent = "메뉴 열기";
    primaryNav.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(willOpen));
    menuButton.querySelector(".sr-only").textContent = willOpen ? "메뉴 닫기" : "메뉴 열기";
    primaryNav.classList.toggle("is-open", willOpen);
  });

  primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMenu();
  });
}

const downloads = {
  windows: document.querySelector("#windows-download"),
  macos: document.querySelector("#macos-download"),
};
const releaseStatus = document.querySelector("#release-status");

if (downloads.windows && downloads.macos && releaseStatus) {
  const platform = /Mac|iPhone|iPad/.test(navigator.platform)
    ? "macos"
    : /Win/.test(navigator.platform)
      ? "windows"
      : null;

  if (platform) downloads[platform].classList.add("recommended");

  const disableDownloads = (message) => {
    Object.values(downloads).forEach((link) => {
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", (event) => event.preventDefault());
    });
    releaseStatus.textContent = message;
  };

  fetch("release.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("release unavailable");
      return response.json();
    })
    .then((release) => {
      if (!release.available) {
        disableDownloads("새 설치 파일을 준비하고 있습니다.");
        return;
      }

      downloads.windows.href = "downloads/Endoumi-Windows-x64.exe";
      downloads.macos.href = "downloads/Endoumi-macOS.dmg";
      releaseStatus.textContent = `최신 버전 ${release.version} · ${release.publishedAt}`;
    })
    .catch(() => {
      releaseStatus.textContent = "배포 기록에서 최신 설치 파일을 확인할 수 있습니다.";
    });
}
