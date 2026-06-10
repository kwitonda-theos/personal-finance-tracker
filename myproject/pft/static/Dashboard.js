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
        // Close sort dropdown if open
        const sortDropdown = document.getElementById(`${prefix}-sort-dropdown`);
        if (sortDropdown) sortDropdown.classList.remove('open');
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

// ========== Table Sort Logic ==========

function initSort(prefix) {
    const dropdown = document.getElementById(`${prefix}-sort-dropdown`);
    if (!dropdown) return;

    const btn = document.getElementById(`${prefix}-sort-btn`);
    const menu = document.getElementById(`${prefix}-sort-menu`);
    const label = document.getElementById(`${prefix}-sort-label`);
    const tbody = document.querySelector(`.${prefix}-rows`);
    const table = tbody ? tbody.closest('table') : null;

    let currentSort = 'date-desc'; // default sort

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close filter dropdown if open
        const filterDropdown = document.getElementById(`${prefix}-filter-dropdown`);
        if (filterDropdown) filterDropdown.classList.remove('open');
        dropdown.classList.toggle('open');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    // Handle option selection in dropdown
    menu.querySelectorAll('.sort-option').forEach((opt) => {
        opt.addEventListener('click', () => {
            const sortValue = opt.dataset.sort;
            currentSort = sortValue;

            // Update active state
            menu.querySelectorAll('.sort-option').forEach((o) => o.classList.remove('active'));
            opt.classList.add('active');

            // Update label
            const labelText = opt.textContent.trim().replace(/[▼▲]/g, '').trim();
            label.textContent = labelText;

            // Close dropdown
            dropdown.classList.remove('open');

            // Apply sort
            applySort(tbody, sortValue);

            // Sync column header indicators
            syncHeaderIcons(table, sortValue);
        });
    });

    // Clickable table column headers
    if (table) {
        table.querySelectorAll('th.sortable-th').forEach((th) => {
            th.addEventListener('click', () => {
                const key = th.dataset.sortKey; // 'date', 'desc', 'amount'
                const [currentKey, currentDir] = currentSort.split('-');

                let newDir;
                if (currentKey === key) {
                    // Toggle direction
                    newDir = currentDir === 'desc' ? 'asc' : 'desc';
                } else {
                    // Default direction for new key
                    newDir = key === 'desc' ? 'asc' : 'desc';
                }

                currentSort = `${key}-${newDir}`;

                // Update dropdown active state
                menu.querySelectorAll('.sort-option').forEach((o) => {
                    o.classList.toggle('active', o.dataset.sort === currentSort);
                    if (o.dataset.sort === currentSort) {
                        const labelText = o.textContent.trim().replace(/[▼▲]/g, '').trim();
                        label.textContent = labelText;
                    }
                });

                // Apply sort
                applySort(tbody, currentSort);

                // Sync header icons
                syncHeaderIcons(table, currentSort);
            });
        });
    }
}

function syncHeaderIcons(table, sortValue) {
    if (!table) return;
    const [sortKey, sortDir] = sortValue.split('-');

    table.querySelectorAll('th.sortable-th').forEach((th) => {
        const icon = th.querySelector('.th-sort-icon');
        if (!icon) return;

        if (th.dataset.sortKey === sortKey) {
            th.classList.add('sort-active');
            icon.textContent = sortDir === 'desc' ? '▼' : '▲';
        } else {
            th.classList.remove('sort-active');
            icon.textContent = '⇅';
        }
    });
}

function applySort(tbody, sortValue) {
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr:not(.empty-row)'));
    if (rows.length === 0) return;

    const [sortKey, sortDir] = sortValue.split('-');
    const multiplier = sortDir === 'asc' ? 1 : -1;

    rows.sort((a, b) => {
        let valA, valB;

        if (sortKey === 'date') {
            valA = new Date(a.cells[0]?.textContent.trim() || '');
            valB = new Date(b.cells[0]?.textContent.trim() || '');
            if (isNaN(valA)) valA = new Date(0);
            if (isNaN(valB)) valB = new Date(0);
            return multiplier * (valA - valB);
        } else if (sortKey === 'amount') {
            valA = parseFloat(a.cells[2]?.textContent.trim() || '0');
            valB = parseFloat(b.cells[2]?.textContent.trim() || '0');
            if (isNaN(valA)) valA = 0;
            if (isNaN(valB)) valB = 0;
            return multiplier * (valA - valB);
        } else if (sortKey === 'desc') {
            valA = (a.cells[1]?.textContent.trim() || '').toLowerCase();
            valB = (b.cells[1]?.textContent.trim() || '').toLowerCase();
            return multiplier * valA.localeCompare(valB);
        }

        return 0;
    });

    // Reorder DOM
    const emptyRow = tbody.querySelector('.empty-row');
    rows.forEach((row) => tbody.appendChild(row));
    if (emptyRow) tbody.appendChild(emptyRow);
}

// Initialize sorting for both tables
initSort('income');
initSort('expenses');
