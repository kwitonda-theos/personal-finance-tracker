// Dashboard.js — Filter logic and interactive features

// ========== Table Filter Logic ==========

function initFilter(prefix) {
    const dropdown = document.getElementById(`${prefix}-filter-dropdown`);
    if (!dropdown) return;

    const btn = document.getElementById(`${prefix}-filter-btn`);
    const menu = document.getElementById(`${prefix}-filter-menu`);
    const label = document.getElementById(`${prefix}-filter-label`);
    const inputWrapper = document.getElementById(`${prefix}-filter-input-wrapper`);
    const input = document.getElementById(`${prefix}-filter-input`);
    const clearBtn = document.getElementById(`${prefix}-filter-clear`);
    const tbody = document.querySelector(`.${prefix}-rows`);

    let currentFilter = 'all';

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    // Handle option selection
    menu.querySelectorAll('.filter-option').forEach((opt) => {
        opt.addEventListener('click', () => {
            const filter = opt.dataset.filter;
            currentFilter = filter;

            // Update active state
            menu.querySelectorAll('.filter-option').forEach((o) => o.classList.remove('active'));
            opt.classList.add('active');

            // Update label
            label.textContent = filter === 'all' ? 'Filter' : opt.textContent;

            // Close dropdown
            dropdown.classList.remove('open');

            // Show/hide and configure input
            if (filter === 'all') {
                inputWrapper.style.display = 'none';
                input.value = '';
                applyFilter(tbody, 'all', '');
            } else {
                inputWrapper.style.display = 'flex';
                input.value = '';

                if (filter === 'month') {
                    input.type = 'month';
                    input.placeholder = '';
                } else if (filter === 'week' || filter === 'date') {
                    input.type = 'date';
                    input.placeholder = '';
                } else {
                    input.type = 'text';
                    input.placeholder = 'Search description...';
                }
                input.focus();
            }
        });
    });

    // Filter on input change
    input.addEventListener('input', () => {
        applyFilter(tbody, currentFilter, input.value);
    });
    input.addEventListener('change', () => {
        applyFilter(tbody, currentFilter, input.value);
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        input.value = '';
        applyFilter(tbody, currentFilter, '');
        input.focus();
    });
}

function applyFilter(tbody, filterType, value) {
    const rows = tbody.querySelectorAll('tr:not(.empty-row)');
    const emptyRow = tbody.querySelector('.empty-row');
    let visibleCount = 0;

    rows.forEach((row) => {
        const dateCell = row.cells[0]?.textContent.trim() || '';
        const descCell = row.cells[1]?.textContent.trim() || '';
        let show = true;

        if (filterType === 'all' || !value) {
            show = true;
        } else if (filterType === 'month') {
            // value is YYYY-MM
            show = dateCell.startsWith(value);
        } else if (filterType === 'week') {
            // value is a date; compute the Monday–Sunday week
            const picked = new Date(value);
            if (!isNaN(picked)) {
                const day = picked.getDay();
                const diffToMonday = (day === 0 ? -6 : 1) - day;
                const weekStart = new Date(picked);
                weekStart.setDate(picked.getDate() + diffToMonday);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);

                const rowDate = new Date(dateCell);
                show = !isNaN(rowDate) && rowDate >= weekStart && rowDate <= weekEnd;
            }
        } else if (filterType === 'date') {
            // value is YYYY-MM-DD
            show = dateCell === value;
        } else if (filterType === 'description') {
            show = descCell.toLowerCase().includes(value.toLowerCase());
        }

        row.style.display = show ? '' : 'none';
        if (show) visibleCount++;
    });

    // Toggle empty-row visibility
    if (emptyRow) {
        emptyRow.style.display = (visibleCount === 0 && rows.length > 0) ? '' : 'none';
    }
}

// Initialize filters for both tables
initFilter('income');
initFilter('expenses');
