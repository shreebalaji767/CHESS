"use strict";

(() => {
    const STORAGE_KEY = "chess-ui-preferences-v2";
    const state = (() => {
        try {
            return { theme: "light", ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
        } catch {
            return { theme: "light" };
        }
    })();

    const save = () => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    };

    const toast = (message) => {
        let el = document.getElementById("chessToast");
        if (!el) {
            el = document.createElement("div");
            el.id = "chessToast";
            el.className = "chess-toast";
            el.setAttribute("role", "status");
            el.setAttribute("aria-live", "polite");
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.classList.add("visible");
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove("visible"), 2200);
    };

    const applyTheme = () => {
        document.documentElement.dataset.theme = state.theme;
        const button = document.getElementById("themeToggle");
        if (button) {
            const dark = state.theme === "dark";
            button.textContent = dark ? "☀ LIGHT" : "☾ DARK";
            button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
            button.setAttribute("aria-pressed", String(dark));
        }
    };

    const toggleTheme = () => {
        state.theme = state.theme === "dark" ? "light" : "dark";
        save();
        applyTheme();
        toast(state.theme === "dark" ? "Dark theme enabled" : "Light theme enabled");
    };

    const addThemeControl = () => {
        const headerRight = document.querySelector(".header-right");
        if (!headerRight || document.getElementById("themeToggle")) return;

        const button = document.createElement("button");
        button.type = "button";
        button.id = "themeToggle";
        button.className = "theme-toggle";
        button.addEventListener("click", toggleTheme);
        headerRight.insertBefore(button, headerRight.firstChild);
        applyTheme();
    };

    const addConnectionStatus = () => {
        if (document.getElementById("connectionStatus")) return;

        const badge = document.createElement("div");
        badge.id = "connectionStatus";
        badge.className = "connection-status";
        badge.setAttribute("role", "status");
        badge.setAttribute("aria-live", "polite");
        document.body.appendChild(badge);

        const update = () => {
            const online = navigator.onLine;
            badge.textContent = online ? "● ONLINE" : "● OFFLINE";
            badge.classList.toggle("offline", !online);
            badge.classList.add("visible");
            clearTimeout(badge._timer);
            if (online) badge._timer = setTimeout(() => badge.classList.remove("visible"), 1800);
        };

        window.addEventListener("online", () => { update(); toast("Connection restored"); });
        window.addEventListener("offline", () => { update(); toast("Offline mode — local features remain available"); });
        update();
    };

    const bindShortcuts = () => {
        document.addEventListener("keydown", (event) => {
            if (event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement) return;

            if (event.key === "Escape") {
                const modal = document.getElementById("lessonModal");
                if (modal && (modal.classList.contains("active") || modal.getAttribute("aria-hidden") === "false")) {
                    document.getElementById("closeLesson")?.click();
                    return;
                }
            }

            const key = event.key.toLowerCase();
            if (key === "n") document.getElementById("newGame")?.click();
            if (key === "u") document.getElementById("undoMove")?.click();
            if (key === "p") document.querySelector('[data-section="play"]')?.click();
            if (key === "a") document.querySelector('[data-section="academy"]')?.click();
        });
    };

    const registerServiceWorker = () => {
        if (!("serviceWorker" in navigator)) return;
        window.addEventListener("load", async () => {
            try {
                await navigator.serviceWorker.register("/static/service-worker.js", { scope: "/" });
            } catch (error) {
                console.warn("Chess service worker registration failed.", error);
            }
        });
    };

    const init = () => {
        applyTheme();
        addThemeControl();
        addConnectionStatus();
        bindShortcuts();
        registerServiceWorker();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
