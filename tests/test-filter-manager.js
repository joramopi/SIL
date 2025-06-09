const fs = require('fs');
const assert = require('assert');

// Minimal DOM stubs
global.window = {};
global.document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: { appendChild() {}, removeChild() {} }
};

global.CONFIG = {
    FIELD_MAPPING: {
        component: ['Componente'],
        direction: ['Direccion'],
        registroAdmin: ['Registro_Administrativo'],
        idRA: ['Id_RA'],
        indicatorName: ['Nombre_Indicador']
    },
    FALLBACK_VALUES: { indicatorName: '' },
    REQUIRED_COLUMNS: ['Componente', 'Direccion', 'SectorE']
};

global.NotificationManager = { show: () => {} };

require('../js/utils.js');
// Expose utils assigned to window as globals for convenience
global.DataUtils = global.window.DataUtils;
global.PerformanceUtils = global.window.PerformanceUtils;
global.ErrorUtils = global.window.ErrorUtils;
require('../js/csvParser.js');
require('../js/filterManager.js');

const CSVParser = global.window.CSVParser;
const FilterManager = global.window.FilterManager;

const csv = fs.readFileSync(__dirname + '/fixtures/sample.csv', 'utf8');
const records = CSVParser.parse(csv);

const fm = new FilterManager();
fm.originalData = records;

// No filters
let result = fm.filterData(records, { component: '', direction: '', search: '' });
assert.strictEqual(result.length, 2, 'No filters should return all records');

// Component filter
result = fm.filterData(records, { component: 'Comp1', direction: '', search: '' });
assert.strictEqual(result.length, 1, 'Component filter should match one record');
assert.strictEqual(result[0].Componente, 'Comp1');

// Direction filter
result = fm.filterData(records, { component: '', direction: 'Dir2', search: '' });
assert.strictEqual(result.length, 1, 'Direction filter should match one record');
assert.strictEqual(result[0].Direccion, 'Dir2');

// Search filter
result = fm.filterData(records, { component: '', direction: '', search: 'eñe' });
assert.strictEqual(result.length, 1, 'Search filter should match by indicator name');
assert.strictEqual(result[0].Nombre_Indicador, 'Indicador con eñe ñ');

// hasActiveFilters
assert.strictEqual(fm.hasActiveFilters(), false, 'Initially no active filters');
fm.filters.component = 'Comp1';
assert.strictEqual(fm.hasActiveFilters(), true, 'Detect active filters');
fm.filters.component = '';
assert.strictEqual(fm.hasActiveFilters(), false, 'Detect clearing of filters');

// getFilterStats
fm.filters.direction = 'Dir1';
const stats = fm.getFilterStats();
assert.strictEqual(stats.activeFilters, 1, 'getFilterStats counts active filters');
assert.strictEqual(stats.originalDataCount, 2, 'getFilterStats reports original data count');

console.log('FilterManager tests passed.');
