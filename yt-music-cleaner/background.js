const RULE_IDS = [1, 2];

const RULES = [
  {
    id: 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { regexSubstitution: "\\1?v=\\2" },
    },
    condition: {
      // Trường hợp: /watch?v=ID&list=...
      regexFilter:
        "^(https?://(?:www\\.|music\\.)?youtube\\.com/watch)\\?v=([^&#]+)&list=[^#]*$",
      resourceTypes: ["main_frame"],
    },
  },
  {
    id: 2,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { regexSubstitution: "\\1?v=\\2" },
    },
    condition: {
      // Trường hợp: /watch?list=...&v=ID (ít gặp hơn nhưng phòng hờ)
      regexFilter:
        "^(https?://(?:www\\.|music\\.)?youtube\\.com/watch)\\?list=[^#]*&v=([^&#]+)(?:&[^#]*)?$",
      resourceTypes: ["main_frame"],
    },
  },
];

async function applyRules(enabled) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: RULE_IDS,
    addRules: enabled ? RULES : [],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["enabled"], (res) => {
    applyRules(res.enabled !== false);
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) applyRules(changes.enabled.newValue);
});
