const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

function render(enabled) {
  toggle.checked = enabled;
  status.textContent = enabled ? "Đang bật" : "Đang tắt";
}

chrome.storage.local.get(["enabled"], (res) => {
  const enabled = res.enabled !== false;
  render(enabled);
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled });
  render(enabled);
});
