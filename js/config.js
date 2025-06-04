// Configuración central del dashboard
export const CONFIG = {
    // Rutas y archivos
    CSV_PATH: 'data/indicators.csv',
    
    // Configuración de gráficos
    CHART_COLORS: [
        '#1e4c72', '#2d5aa0', '#4a90c2', 
        '#87ceeb', '#a0c8e8', '#b3d9ff'
    ],
    
    // Datos de ejemplo
    PERIODICITIES: ['Mensual', 'Trimestral', 'Semestral', 'Anual'],
    
    // Configuración de rendimiento
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    
    // Validaciones
    REQUIRED_COLUMNS: ['Componente', 'Direccion', 'SectorE'],
    
    // Valores por defecto
    FALLBACK_VALUES: {
        indicatorName: 'Sin nombre definido',
        component: 'Sin categorizar',
        direction: 'No especificada',
        sector: 'No definido',
        lastUpdate: 'No disponible'
    },
    
    // Configuración de tabla
    TABLE_PAGE_SIZE: 50,
    MAX_VISIBLE_ROWS: 1000,
    
    // Configuración de notificaciones
    NOTIFICATION_DURATION: 5000,
    
    // Configuración de exportación
    EXPORT_FILENAME_PREFIX: 'indicadores_gadpm',
    
    // URLs de APIs (para futuras integraciones)
    API_ENDPOINTS: {
        indicators: '/api/indicators',
        export: '/api/export',
        statistics: '/api/stats'
    }
};

// Configuración de Chart.js
export const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                padding: 20,
                usePointStyle: true,
                font: {
                    size: 12
                }
            }
        }
    }
};

// Mensajes de error estandarizados
export const ERROR_MESSAGES = {
    CSV_LOAD_ERROR: 'Error al cargar el archivo de datos. Verifica tu conexión.',
    CSV_PARSE_ERROR: 'Error al procesar los datos. Formato de archivo incorrecto.',
    MISSING_COLUMNS: 'El archivo no contiene las columnas requeridas.',
    NO_DATA: 'No se encontraron datos para mostrar.',
    FILTER_ERROR: 'Error al aplicar los filtros seleccionados.',
    CHART_ERROR: 'Error al generar los gráficos.'
};

// Configuración de validación
export const VALIDATION_RULES = {
    minDataRows: 1,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['text/csv', 'application/csv'],
    requiredHeaders: CONFIG.REQUIRED_COLUMNS
};
