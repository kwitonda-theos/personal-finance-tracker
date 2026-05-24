// DOM references
const income = document.querySelector('.income-tab');
const expenses = document.querySelector('.expenses-tab');
const dashboard = document.querySelector('.Dashboard-tab');
const forms = document.querySelectorAll('.form-section');
const incomeSection = document.querySelector('.income-section');
const expensesSection = document.querySelector('.expenses-section');

// Tab switching
income.addEventListener('click', () => {
    for (let form of forms) {
        form.style.display = 'none';
    }
    incomeSection.style.display = 'block';
    expensesSection.style.display = 'none';
});

expenses.addEventListener('click', () => {
    for (let form of forms) {
        form.style.display = 'none';
    }
    expensesSection.style.display = 'block';
    incomeSection.style.display = 'none';
});

dashboard.addEventListener('click', () => {
    for (let form of forms) {
        form.style.display = 'block';
    }
    incomeSection.style.display = 'none';
    expensesSection.style.display = 'none';
});

// Auto-dismiss flash messages after 4 seconds
document.querySelectorAll('.alert').forEach((alert) => {
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        setTimeout(() => alert.remove(), 300);
    }, 4000);
});
