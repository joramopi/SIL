const assert = require('assert');

// Minimal DOM stubs
global.window = { addEventListener() {} };

global.document = {
    querySelector(selector) {
        if (selector === '#componentChart' || selector === '#periodicityChart') {
            return { getContext: () => ({}) };
        }
        if (selector.endsWith('Loading') || selector.endsWith('Error')) {
            return { style: {}, innerHTML: '', querySelector: () => ({ textContent: '' }) };
        }
        return null;
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: { appendChild() {}, removeChild() {} }
};

global.CONFIG = {
    CHART_COLORS: ['#1','#2','#3','#4'],
    PERIODICITY_COLORS: ['#1','#2','#3','#4'],
    PERIODICITIES: ['Mensual','Trimestral','Semestral','Anual'],
    CHART_ANIMATION_DURATION: 0,
    MAX_CHART_ITEMS: 10
};

global.NotificationManager = { show: () => {} };

class FakeChart {
    constructor(ctx, cfg) {
        this.data = JSON.parse(JSON.stringify(cfg.data));
        this.options = cfg.options || {};
    }
    update() {}
    destroy() {}
    resize() {}
    toBase64Image() { return ''; }
    getDatasetMeta() { return { data: [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}] }; }
}

global.Chart = FakeChart;

require('../js/utils.js');
global.DOMUtils = global.window.DOMUtils;
global.PerformanceUtils = global.window.PerformanceUtils;
global.ErrorUtils = global.window.ErrorUtils;
require('../js/chartManager.js');

const ChartManager = global.window.ChartManager;

const cm = new ChartManager();
cm.initialize();

let emptyCalled = false;
cm.showEmptyChart = function(id) { if (id === 'componentChart') emptyCalled = true; };

cm.updateCharts([]);

assert.strictEqual(emptyCalled, true, 'showEmptyChart should be called for empty component data');
assert.deepStrictEqual(cm.charts.periodicity.data.datasets[0].data, [0,0,0,0], 'Periodicity chart uses zeroes for empty dataset');

console.log('ChartManager tests passed.');
