const fs = require('fs');
const assert = require('assert');

// Minimal globals expected by csvParser.js
global.window = {};
// Provide only the fields used by CSVParser
global.CONFIG = {
  REQUIRED_COLUMNS: ['Componente', 'Direccion', 'SectorE'],
  FALLBACK_VALUES: { indicatorName: 'Sin nombre' }
};
// Stub NotificationManager to avoid DOM usage
global.NotificationManager = { show: () => {} };

// Load the parser script which assigns CSVParser to window
require('../js/csvParser.js');
const CSVParser = global.window.CSVParser;

const csv = fs.readFileSync(__dirname + '/fixtures/sample.csv', 'utf8');
const records = CSVParser.parse(csv);

assert(Array.isArray(records), 'parse should return an array');
assert.strictEqual(records.length, 2, 'should return two records');
assert.strictEqual(records[0].Nombre_Indicador, 'Indicador con acento á');
assert.strictEqual(records[1].Nombre_Indicador, 'Indicador con eñe ñ');

console.log('All tests passed.');
