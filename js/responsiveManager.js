class ResponsiveManager {
    constructor() {
        this.breakpoints = CONFIG.BREAKPOINTS;
        this.subscribers = [];
        this.currentConfig = {};
        this.handleResize = PerformanceUtils.debounce(this.update.bind(this), 100);
    }

    init() {
        this.update();
        window.addEventListener('resize', this.handleResize);
    }

    register(component) {
        if (component && typeof component.onResize === 'function') {
            this.subscribers.push(component);
        }
    }

    update() {
        const config = CONFIG.getResponsiveConfig();
        this.applyCssVars(config);
        if (JSON.stringify(config) !== JSON.stringify(this.currentConfig)) {
            this.currentConfig = config;
            this.notify(config);
        }
    }

    applyCssVars(cfg) {
        const root = document.documentElement;
        root.style.setProperty('--chart-height', cfg.chartHeight + 'px');
        root.style.setProperty('--table-page-size', cfg.tablePageSize);
        root.style.setProperty('--notification-position', cfg.notificationPosition);
        root.style.setProperty('--is-mobile', cfg.isMobile ? '1' : '0');

        const width = window.innerWidth;
        let statsMin = '280px';
        let filtersMin = '250px';
        let chartsMin = '400px';

        if (width < this.breakpoints.md) {
            statsMin = '100%';
            filtersMin = '100%';
            chartsMin = '100%';
        } else if (width < this.breakpoints.lg) {
            statsMin = '220px';
            filtersMin = '200px';
            chartsMin = '280px';
        }

        root.style.setProperty('--stats-col-min', statsMin);
        root.style.setProperty('--filters-col-min', filtersMin);
        root.style.setProperty('--charts-col-min', chartsMin);
    }

    notify(cfg) {
        this.subscribers.forEach(sub => {
            try {
                sub.onResize(cfg);
            } catch (e) {
                console.error('ResponsiveManager subscriber error', e);
            }
        });
    }
}

window.ResponsiveManager = new ResponsiveManager();
