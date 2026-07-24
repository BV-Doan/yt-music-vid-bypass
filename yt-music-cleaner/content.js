(function () {
  let enabled = true;

  chrome.storage.local.get(["enabled"], (res) => {
    enabled = res.enabled !== false; // mặc định bật
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) enabled = changes.enabled.newValue;
  });

  // Trích video id từ 1 URL bất kỳ, trả về null nếu không phải link watch có list
  function getVideoIdIfHasList(href) {
    let url;
    try {
      url = new URL(href, location.href);
    } catch (e) {
      return null;
    }
    if (!/youtube\.com$/.test(url.hostname.replace(/^www\.|^music\./, "")) &&
        url.hostname !== "youtube.com") {
      // chấp nhận cả music.youtube.com / www.youtube.com
    }
    if (!url.pathname.startsWith("/watch")) return null;
    if (!url.searchParams.has("list")) return null;
    return url.searchParams.get("v");
  }

  function cleanUrlFor(href) {
    const videoId = getVideoIdIfHasList(href);
    if (!videoId) return null;
    const clean = new URL(location.origin + "/watch");
    clean.searchParams.set("v", videoId);
    return clean.toString();
  }

  // 1) CHẶN CLICK TRƯỚC KHI YOUTUBE KỊP XỬ LÝ (quan trọng nhất)
  // Bắt ở capture phase + stopImmediatePropagation để YouTube
  // không kịp đọc list= và khởi tạo phiên radio.
  document.addEventListener(
    "click",
    (e) => {
      if (!enabled) return;
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return; // để trình duyệt lo vụ mở tab mới

      const link = e.target.closest ? e.target.closest("a[href]") : null;
      if (!link) return;

      const clean = cleanUrlFor(link.href);
      if (!clean) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      // Điều hướng full-navigation tới URL sạch, y hệt việc tự tay sửa URL rồi Enter
      window.location.href = clean;
    },
    true
  );

  // 2) Ctrl/Cmd + click hoặc chuột giữa -> mở tab mới nhưng vẫn dùng URL sạch
  function handleNewTabClick(e) {
    if (!enabled) return;
    const link = e.target.closest ? e.target.closest("a[href]") : null;
    if (!link) return;
    const clean = cleanUrlFor(link.href);
    if (!clean) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.open(clean, "_blank");
  }
  document.addEventListener(
    "click",
    (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) handleNewTabClick(e);
    },
    true
  );
  document.addEventListener("auxclick", handleNewTabClick, true); // chuột giữa

  // 3) Lưới an toàn: nếu URL vẫn lọt list= do trường hợp khác (gõ tay, mở link ngoài...)
  function cleanCurrentUrl() {
    if (!enabled) return;
    const clean = cleanUrlFor(location.href);
    if (!clean) return;
    history.replaceState(history.state, "", clean);
  }
  document.addEventListener("yt-navigate-finish", cleanCurrentUrl);
  window.addEventListener("popstate", cleanCurrentUrl);
  window.addEventListener("load", cleanCurrentUrl);
})();
