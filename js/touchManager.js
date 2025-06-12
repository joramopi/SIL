class TouchManager {
    constructor(options = {}) {
        this.pullToRefresh = options.pullToRefresh || false;
        this.swipeThreshold = options.swipeThreshold || 50; // px
        this.pullThreshold = options.pullThreshold || 80; // px
    }

    init() {
        ['.ods-panel', '.table-container', '.charts-section'].forEach(selector => {
            const el = document.querySelector(selector);
            if (el) this._addSwipeListeners(el);
        });
    }

    _addSwipeListeners(el) {
        let startX = 0;
        let startY = 0;
        let startScroll = 0;
        let touching = false;

        el.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            startScroll = el.scrollTop;
            touching = true;
        }, { passive: true });

        el.addEventListener('touchend', (e) => {
            if (!touching) return;
            const t = e.changedTouches[0];
            const deltaX = t.clientX - startX;
            const deltaY = t.clientY - startY;
            touching = false;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
                const dir = deltaX < 0 ? 'left' : 'right';
                this._scroll(el, dir);
                this._feedback(`Swipe ${dir}`);
            } else if (this.pullToRefresh && deltaY > this.pullThreshold && el.scrollTop === 0 && startScroll === 0) {
                this._feedback('Actualizando...');
                window.location.reload();
            }
        }, { passive: true });
    }

    _scroll(el, direction) {
        const offset = el.clientWidth * 0.8;
        const dx = direction === 'left' ? offset : -offset;
        el.scrollBy({ left: dx, behavior: 'smooth' });
    }

    _feedback(message) {
        if (window.NotificationManager) {
            NotificationManager.show(message, 'info', 1500);
        } else {
            console.log(message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tm = new TouchManager({ pullToRefresh: true });
    tm.init();
    window.touchManager = tm;
});

window.TouchManager = TouchManager;
