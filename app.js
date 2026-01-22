// ==================== DRAG AND DROP WIDGETS ====================
let draggedElement = null;

document.addEventListener('DOMContentLoaded', () => {
    initDraggableWidgets();
    initTabs();
    initKeyboardShortcuts();
});

function initDraggableWidgets() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;

    const widgets = statsGrid.querySelectorAll('.stat-card.draggable');

    widgets.forEach(widget => {
        widget.addEventListener('dragstart', handleDragStart);
        widget.addEventListener('dragend', handleDragEnd);
        widget.addEventListener('dragover', handleDragOver);
        widget.addEventListener('dragenter', handleDragEnter);
        widget.addEventListener('dragleave', handleDragLeave);
        widget.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Add slight delay for visual feedback
    setTimeout(() => {
        this.style.opacity = '0.4';
    }, 0);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    this.style.opacity = '1';
    
    // Remove drag-over class from all widgets
    document.querySelectorAll('.stat-card').forEach(widget => {
        widget.classList.remove('drag-over');
    });
    
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (draggedElement !== this) {
        // Swap the widgets
        const statsGrid = document.getElementById('statsGrid');
        const allWidgets = [...statsGrid.querySelectorAll('.stat-card')];
        const draggedIndex = allWidgets.indexOf(draggedElement);
        const targetIndex = allWidgets.indexOf(this);
        
        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedElement, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedElement, this);
        }
        
        // Save order to localStorage
        saveWidgetOrder();
    }
    
    this.classList.remove('drag-over');
    return false;
}

function saveWidgetOrder() {
    const statsGrid = document.getElementById('statsGrid');
    const widgets = statsGrid.querySelectorAll('.stat-card');
    const order = [];
    
    widgets.forEach(widget => {
        order.push(widget.dataset.widgetId);
    });
    
    localStorage.setItem('widgetOrder', JSON.stringify(order));
}

function loadWidgetOrder() {
    const savedOrder = localStorage.getItem('widgetOrder');
    if (!savedOrder) return;
    
    const order = JSON.parse(savedOrder);
    const statsGrid = document.getElementById('statsGrid');
    
    order.forEach(widgetId => {
        const widget = statsGrid.querySelector(`[data-widget-id="${widgetId}"]`);
        if (widget) {
            statsGrid.appendChild(widget);
        }
    });
}

// ==================== EXPANDABLE WIDGETS ====================
function toggleExpand(btn) {
    const card = btn.closest('.stat-card');
    const isExpanded = card.classList.contains('expanded');
    
    // Close all other expanded cards first
    document.querySelectorAll('.stat-card.expanded').forEach(expandedCard => {
        if (expandedCard !== card) {
            expandedCard.classList.remove('expanded');
        }
    });
    
    // Toggle current card
    card.classList.toggle('expanded');
    
    // Update button icon
    if (card.classList.contains('expanded')) {
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>
        </svg>`;
    } else {
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>`;
    }
}

// ==================== WIDGET MODAL ====================
function openExpandedWidget(widgetId) {
    const modal = document.getElementById('widgetModal');
    const content = document.getElementById('widgetModalContent');
    
    // Get widget data based on ID
    const widgetData = getWidgetData(widgetId);
    
    content.innerHTML = `
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="card-title">${widgetData.title}</h2>
            <button onclick="closeExpandedWidget()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 8px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
        <div class="card-body">
            ${widgetData.content}
        </div>
    `;
    
    modal.classList.add('active');
}

function closeExpandedWidget() {
    const modal = document.getElementById('widgetModal');
    modal.classList.remove('active');
}

function getWidgetData(widgetId) {
    const data = {
        revenue: {
            title: 'Revenue Details',
            content: `
                <div style="margin-bottom: 24px;">
                    <div style="font-size: 36px; font-weight: 700; margin-bottom: 4px;">$12,847</div>
                    <div style="color: var(--accent-success); font-size: 14px;">+23.5% from yesterday</div>
                </div>
                <div style="height: 200px; display: flex; align-items: flex-end; gap: 8px; margin-bottom: 24px;">
                    ${[60, 80, 45, 90, 70, 100, 85].map((h, i) => `
                        <div style="flex: 1; height: ${h}%; background: linear-gradient(180deg, var(--accent-primary) 0%, rgba(99, 91, 255, 0.3) 100%); border-radius: 4px 4px 0 0;"></div>
                    `).join('')}
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div style="padding: 16px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">Cash</div>
                        <div style="font-size: 18px; font-weight: 600;">$4,230</div>
                    </div>
                    <div style="padding: 16px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">Card</div>
                        <div style="font-size: 18px; font-weight: 600;">$7,412</div>
                    </div>
                    <div style="padding: 16px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">Online</div>
                        <div style="font-size: 18px; font-weight: 600;">$1,205</div>
                    </div>
                </div>
            `
        },
        orders: {
            title: 'Orders Breakdown',
            content: `<p>Detailed orders information...</p>`
        },
        guests: {
            title: 'Guest Analytics',
            content: `<p>Detailed guest information...</p>`
        },
        waittime: {
            title: 'Wait Time Analysis',
            content: `<p>Detailed wait time information...</p>`
        }
    };
    
    return data[widgetId] || { title: 'Widget', content: '' };
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('widget-modal-backdrop')) {
        closeExpandedWidget();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeExpandedWidget();
    }
});

// ==================== TABS ====================
function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const tabs = tabContainer.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    });
}

// ==================== KEYBOARD SHORTCUTS ====================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K for search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

// ==================== FILTER BUTTONS ====================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Don't deactivate if it's after a divider (date filter)
        const isDateFilter = btn.previousElementSibling?.classList.contains('filter-divider');
        
        if (!isDateFilter) {
            const filterBar = btn.closest('.filter-bar');
            filterBar.querySelectorAll('.filter-btn').forEach(b => {
                if (!b.previousElementSibling?.classList.contains('filter-divider')) {
                    b.classList.remove('active');
                }
            });
        }
        
        btn.classList.toggle('active');
    });
});

// ==================== LIVE UPDATES SIMULATION ====================
function simulateLiveUpdates() {
    // Simulate random order status updates
    setInterval(() => {
        const statusBadges = document.querySelectorAll('.status-badge');
        if (statusBadges.length > 0) {
            const randomBadge = statusBadges[Math.floor(Math.random() * statusBadges.length)];
            // Flash effect
            randomBadge.style.transform = 'scale(1.1)';
            setTimeout(() => {
                randomBadge.style.transform = 'scale(1)';
            }, 200);
        }
    }, 10000);
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success' 
                ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
                : '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>'
            }
        </svg>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadWidgetOrder();
    // simulateLiveUpdates(); // Uncomment to enable live update simulation
});
