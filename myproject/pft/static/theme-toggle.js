/**
 * Theme Toggle — persists user preference in localStorage.
 * Include this script on every page AFTER the toggle button markup.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'pft-theme';
    const DARK = 'dark';
    const LIGHT = 'light';

    // Apply saved theme instantly (before paint) to prevent flash
    function getPreferredTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }

    // Apply immediately
    applyTheme(getPreferredTheme());

    // Wire up click after DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('theme-toggle-btn');
        if (!btn) return;

        btn.addEventListener('click', function () {
            const current = document.documentElement.getAttribute('data-theme') || LIGHT;
            const next = current === DARK ? LIGHT : DARK;
            applyTheme(next);

            // Trigger rotation animation
            btn.classList.add('animate');
            setTimeout(function () {
                btn.classList.remove('animate');
            }, 400);
        });
    });
})();
