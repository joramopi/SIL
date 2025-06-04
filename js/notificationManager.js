// js/notificationManager.js
class NotificationManager {
    static show(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="Cerrar notificación">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto-remove
        const autoRemove = setTimeout(() => this.remove(notification), duration);

        // Manual remove
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.remove(notification);
        });

        return notification;
    }

    static getIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    static remove(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
}

// Hacer disponible globalmente
window.NotificationManager = NotificationManager;
