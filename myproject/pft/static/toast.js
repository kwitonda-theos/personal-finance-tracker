/**
 * Toast Notification System
 * Usage:
 *   showToast({ type: 'success', message: 'Done!' })
 *   showToast({ type: 'error', title: 'Oops', message: 'Something went wrong.' })
 */

(function () {
    'use strict';

    const ICONS = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    };

    const TITLES = {
        success: 'Success',
        error: 'Error',
        info: 'Info',
        warning: 'Warning',
    };

    const DURATIONS = {
        success: 4000,
        error: 6000,
        info: 4000,
        warning: 5000,
    };

    function getContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function showToast({ type = 'info', title, message = '', duration } = {}) {
        const resolvedType = type === 'success' || type === 'error' || type === 'info' || type === 'warning' ? type : 'info';
        const resolvedTitle = title || TITLES[resolvedType];
        const resolvedDuration = duration || DURATIONS[resolvedType];

        const toast = document.createElement('div');
        toast.className = `toast toast-${resolvedType}`;

        toast.innerHTML = `
            <div class="toast-icon">${ICONS[resolvedType]}</div>
            <div class="toast-body">
                <p class="toast-title">${resolvedTitle}</p>
                <p class="toast-message">${escapeHtml(message)}</p>
            </div>
            <button class="toast-close" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="toast-progress">
                <div class="toast-progress-bar"></div>
            </div>
        `;

        // Animate progress bar
        const bar = toast.querySelector('.toast-progress-bar');
        bar.style.animation = `toastProgress ${resolvedDuration}ms linear forwards`;

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));

        // Auto-dismiss
        const timer = setTimeout(() => dismissToast(toast), resolvedDuration);

        // Pause on hover
        toast.addEventListener('mouseenter', () => {
            clearTimeout(timer);
            bar.style.animationPlayState = 'paused';
        });
        toast.addEventListener('mouseleave', () => {
            bar.style.animationPlayState = 'running';
            // Restart the auto-dismiss with remaining time approximation
            setTimeout(() => dismissToast(toast), 2000);
        });

        getContainer().appendChild(toast);
    }

    function dismissToast(toast) {
        if (toast.classList.contains('toast-exit')) return;
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => {
            toast.remove();
            // Clean up empty container
            const container = document.getElementById('toast-container');
            if (container && container.children.length === 0) {
                container.remove();
            }
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Inject the progress bar keyframe dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastProgress {
            from { transform: scaleX(1); }
            to   { transform: scaleX(0); }
        }
    `;
    document.head.appendChild(style);

    // Expose globally
    window.showToast = showToast;

    // Auto-consume Django messages injected as JSON
    document.addEventListener('DOMContentLoaded', () => {
        const dataEl = document.getElementById('django-messages-data');
        if (!dataEl) return;
        try {
            const msgs = JSON.parse(dataEl.textContent);
            msgs.forEach((m) => {
                showToast({ type: m.tags || 'info', message: m.message });
            });
        } catch (_) {
            // Silently ignore bad JSON
        }
    });
})();
