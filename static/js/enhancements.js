"use strict";

(() => {
    const PREFS_KEY = "chess-ui-preferences-v3";
    const STATS_KEY = "chess-local-stats-v2";

    const safeRead = (key, fallback = {}) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value && typeof value === "object" ? value : fallback;
        } catch {
            return fallback;
        }
    };

    const prefs = {
        theme: "system",
        sound: true,
        ...(safeRead(PREFS_KEY, {}))
    };

    const savePrefs = () => {
        try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
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
        el._timer = setTimeout(() => el.classList.remove("visible"), 2400);
    };

    const resolvedTheme = () => {
        if (prefs.theme === "system") {
            return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return prefs.theme;
    };

    const applyTheme = () => {
        const theme = resolvedTheme();
        document.documentElement.dataset.theme = theme;

        const button = document.getElementById("themeToggle");
        if (button) {
            button.textContent =
                prefs.theme === "system" ? "◐ SYSTEM" :
                theme === "dark" ? "☀ LIGHT" : "☾ DARK";
            button.title = "Theme: " + prefs.theme;
            button.setAttribute("aria-pressed", String(theme === "dark"));
        }

        const meta = document.getElementById("themeColorMeta");
        if (meta) meta.content = theme === "dark" ? "#0f1115" : "#111827";
    };

    const cycleTheme = () => {
        prefs.theme =
            prefs.theme === "system" ? "dark" :
            prefs.theme === "dark" ? "light" : "system";
        savePrefs();
        applyTheme();
        toast("Theme: " + prefs.theme);
    };

    const playTone = (frequency = 520, duration = 0.045) => {
        if (!prefs.sound) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = frequency;
            osc.type = "sine";
            gain.gain.setValueAtTime(0.035, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
            osc.addEventListener("ended", () => ctx.close(), { once: true });
        } catch {}
    };

    const addHeaderControls = () => {
        const headerRight = document.querySelector(".header-right");
        if (!headerRight) return;

        if (!document.getElementById("themeToggle")) {
            const theme = document.createElement("button");
            theme.type = "button";
            theme.id = "themeToggle";
            theme.className = "utility-button";
            theme.addEventListener("click", cycleTheme);
            headerRight.prepend(theme);
        }

        if (!document.getElementById("soundToggle")) {
            const sound = document.createElement("button");
            sound.type = "button";
            sound.id = "soundToggle";
            sound.className = "utility-button";
            sound.addEventListener("click", () => {
                prefs.sound = !prefs.sound;
                savePrefs();
                updateSoundButton();
                if (prefs.sound) playTone();
                toast(prefs.sound ? "Sound enabled" : "Sound muted");
            });
            headerRight.prepend(sound);
        }

        if (!document.getElementById("fullscreenToggle")) {
            const full = document.createElement("button");
            full.type = "button";
            full.id = "fullscreenToggle";
            full.className = "utility-button";
            full.textContent = "⛶ FULL";
            full.addEventListener("click", async () => {
                try {
                    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
                    else await document.exitFullscreen();
                } catch {
                    toast("Fullscreen is not available here");
                }
            });
            headerRight.prepend(full);
        }

        applyTheme();
        updateSoundButton();
    };

    const updateSoundButton = () => {
        const button = document.getElementById("soundToggle");
        if (!button) return;
        button.textContent = prefs.sound ? "🔊 SOUND" : "🔇 MUTED";
        button.setAttribute("aria-pressed", String(prefs.sound));
    };

    const addConnectionStatus = () => {
        if (document.getElementById("connectionStatus")) return;

        const badge = document.createElement("div");
        badge.id = "connectionStatus";
        badge.className = "connection-status";
        badge.setAttribute("role", "status");
        badge.setAttribute("aria-live", "polite");
        document.body.appendChild(badge);

        const update = (show = true) => {
            const online = navigator.onLine;
            badge.textContent = online ? "● ONLINE" : "● OFFLINE";
            badge.classList.toggle("offline", !online);
            if (show) {
                badge.classList.add("visible");
                clearTimeout(badge._timer);
                if (online) badge._timer = setTimeout(() => badge.classList.remove("visible"), 1800);
            }
        };

        window.addEventListener("online", () => {
            update();
            toast("Connection restored");
        });
        window.addEventListener("offline", () => {
            update();
            toast("Offline mode — your local game remains available");
        });
        update(false);
    };

    const installPWA = () => {
        let deferredPrompt = null;

        window.addEventListener("beforeinstallprompt", (event) => {
            event.preventDefault();
            deferredPrompt = event;
            const button = document.getElementById("installButton");
            if (button) button.style.display = "";
        });

        document.getElementById("installButton")?.addEventListener("click", async () => {
            if (!deferredPrompt) {
                toast("Open your browser menu to install CHESS");
                return;
            }
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            deferredPrompt = null;
            if (choice?.outcome === "accepted") toast("CHESS installed");
            document.getElementById("installButton").style.display = "none";
        });

        window.addEventListener("appinstalled", () => toast("CHESS is now installed"));
    };

    const bindShortcuts = () => {
        document.addEventListener("keydown", (event) => {
            if (event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement) return;

            const key = event.key.toLowerCase();

            if (event.key === "Escape") {
                const modal = document.getElementById("lessonModal");
                if (modal?.classList.contains("active") || modal?.getAttribute("aria-hidden") === "false") {
                    document.getElementById("closeLesson")?.click();
                    return;
                }
            }

            if (key === "n") document.getElementById("newGame")?.click();
            if (key === "u") document.getElementById("undoMove")?.click();
            if (key === "p") document.querySelector('[data-section="play"]')?.click();
            if (key === "a") document.querySelector('[data-section="academy"]')?.click();
            if (key === "m") document.getElementById("soundToggle")?.click();
            if (key === "f") document.getElementById("fullscreenToggle")?.click();
        });
    };

    const bindChessFeedback = () => {
        document.addEventListener("click", (event) => {
            const square = event.target.closest?.(".chess-square");
            if (square) playTone(square.classList.contains("capture-move") ? 300 : 520, 0.035);
        }, { passive: true });
    };

    const installErrorBoundary = () => {
        window.addEventListener("error", (event) => {
            console.error("CHESS runtime error:", event.error || event.message);
            toast("A game error occurred. Try starting a new game.");
        });

        window.addEventListener("unhandledrejection", (event) => {
            console.error("CHESS promise error:", event.reason);
            toast("Something went wrong. Please try again.");
        });
    };

    const rememberStats = () => {
        const ids = ["games", "wins", "losses", "draws"];
        const saved = safeRead(STATS_KEY, {});
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el && saved[id] != null && el.textContent.trim() === "0") {
                el.textContent = String(saved[id]);
            }
        }

        const observer = new MutationObserver(() => {
            const next = {};
            for (const id of ids) {
                const el = document.getElementById(id);
                next[id] = Number.parseInt(el?.textContent || "0", 10) || 0;
            }
            try { localStorage.setItem(STATS_KEY, JSON.stringify(next)); } catch {}
        });

        const target = document.querySelector(".statistics-grid");
        if (target) observer.observe(target, { subtree: true, childList: true, characterData: true });
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
        addHeaderControls();
        addConnectionStatus();
        installPWA();
        bindShortcuts();
        bindChessFeedback();
        installErrorBoundary();
        rememberStats();
        registerServiceWorker();

        matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
            if (prefs.theme === "system") applyTheme();
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
