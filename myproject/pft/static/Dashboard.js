// Auto-dismiss flash messages after 4 seconds
document.querySelectorAll('.alert').forEach((alert) => {
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        setTimeout(() => alert.remove(), 300);
    }, 4000);
});
