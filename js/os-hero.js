/**
 * Detect visitor OS from User-Agent (+ platform hints) for hero copy.
 * Prefer Client Hints platform when available; fall back to UA string.
 */
(function () {
  function detectOS() {
    var ua = navigator.userAgent || "";
    var platform = navigator.platform || "";
    var uaData = navigator.userAgentData;

    if (uaData && uaData.platform) {
      var p = String(uaData.platform).toLowerCase();
      if (p === "macos" || p === "mac os") return "mac";
      if (p === "windows") return "windows";
      if (p === "linux") return "linux";
      if (p === "android") return "android";
      if (p === "ios" || p === "ipados") return "ios";
      if (p.indexOf("chrome") !== -1) return "chromeos";
    }

    // iPadOS 13+ can report as Mac with touch
    if (
      /iPad|iPhone|iPod/.test(ua) ||
      (platform === "MacIntel" && navigator.maxTouchPoints > 1)
    ) {
      return "ios";
    }
    if (/Macintosh|Mac OS X|Mac_PowerPC/i.test(ua) || /Mac/i.test(platform)) {
      return "mac";
    }
    if (/Windows|Win32|Win64|WOW64/i.test(ua) || /^Win/i.test(platform)) {
      return "windows";
    }
    if (/Android/i.test(ua)) return "android";
    if (/CrOS/i.test(ua)) return "chromeos";
    if (/Linux/i.test(ua) || /Linux/i.test(platform)) return "linux";
    return "unknown";
  }

  var lines = {
    mac: {
      h1: "Stream Xbox.<br />On your Mac.<br />On your terms.",
      sub:
        "Native macOS desktop app for xCloud and console home streaming — open source, public beta.",
      cta: "Download for Mac",
      badge: "Detected: macOS",
    },
    windows: {
      h1: "Stream Xbox.<br />On your Windows PC.<br />On your terms.",
      sub:
        "Native Windows desktop app for xCloud and console home streaming — open source, public beta.",
      cta: "Download for Windows",
      badge: "Detected: Windows",
    },
    linux: {
      h1: "Stream Xbox.<br />Desktop streaming.<br />On your terms.",
      sub:
        "Blacklight ships macOS and Windows builds today. Follow GitHub Releases for updates.",
      cta: "Get the latest build",
      badge: "Detected: Linux",
    },
    ios: {
      h1: "Stream Xbox.<br />Desktop-first.<br />On your terms.",
      sub:
        "Blacklight is a native macOS and Windows app. Open this page on your Mac or PC to download the beta.",
      cta: "View downloads",
      badge: "Detected: iOS / iPadOS",
    },
    android: {
      h1: "Stream Xbox.<br />Desktop-first.<br />On your terms.",
      sub:
        "Blacklight is a native macOS and Windows app. Open this page on your computer to download the beta.",
      cta: "View downloads",
      badge: "Detected: Android",
    },
    chromeos: {
      h1: "Stream Xbox.<br />Desktop streaming.<br />On your terms.",
      sub:
        "Blacklight targets macOS and Windows today. Download a release on a supported desktop.",
      cta: "Get the latest build",
      badge: "Detected: ChromeOS",
    },
    unknown: {
      h1: "Stream Xbox.<br />On your desktop.<br />On your terms.",
      sub:
        "Independent open-source Xbox streaming for macOS and Windows — xCloud and console home play.",
      cta: "Get the latest build",
      badge: "Desktop app · Mac & Windows",
    },
  };

  function apply() {
    var os = detectOS();
    var copy = lines[os] || lines.unknown;
    var h1 = document.querySelector("[data-hero-title]");
    var sub = document.querySelector("[data-hero-sub]");
    var badge = document.querySelector("[data-os-badge]");
    var ctas = document.querySelectorAll("[data-download-cta]");

    if (h1) h1.innerHTML = copy.h1;
    if (sub) sub.textContent = copy.sub;
    if (badge) {
      badge.textContent = copy.badge;
      badge.hidden = false;
      badge.dataset.os = os;
    }
    ctas.forEach(function (el) {
      el.textContent = copy.cta;
    });
    document.documentElement.dataset.visitorOs = os;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
