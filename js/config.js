// js/config.js
const CONFIG = {
    // Data Source
    CSV_PATH: 'data/indicators.csv',
    
    // Chart Configuration - Paleta de azules y verdes
    CHART_COLORS: [
        '#1e4c72', // Azul oscuro (Primary Blue)
        '#2d5aa0', // Azul medio (Secondary Blue) 
        '#4a90c2', // Azul claro (Light Blue)
        '#1565c0', // Azul material
        '#1976d2', // Azul vibrante
        '#42a5f5', // Azul cielo
        '#2e7d32', // Verde oscuro
        '#388e3c', // Verde medio
        '#43a047', // Verde claro
        '#4caf50', // Verde material
        '#66bb6a', // Verde suave
        '#81c784', // Verde pastel
        '#00695c', // Verde azulado oscuro
        '#00796b', // Verde azulado
        '#26a69a', // Verde azulado claro
        '#4db6ac', // Verde agua
        '#0d47a1', // Azul marino
        '#1e88e5', // Azul eléctrico
        '#29b6f6', // Azul celeste
        '#4fc3f7'  // Azul cielo claro
    ],
    
    // Colores específicos para periodicidad
    PERIODICITY_COLORS: [
        '#1e4c72', // Mensual - Azul oscuro
        '#2e7d32', // Trimestral - Verde oscuro  
        '#1565c0', // Semestral - Azul material
        '#388e3c'  // Anual - Verde medio
    ],
    
    // Data Configuration
    PERIODICITIES: ['Mensual', 'Trimestral', 'Semestral', 'Anual'],
    
    // CSV Validation
    REQUIRED_COLUMNS: ['Componente', 'Direccion', 'SectorE'],
    OPTIONAL_COLUMNS: ['Nombre_Indicador', 'N', 'Id_RA', 'Registro_Administrativo', 'Indicador'],
    
    // Fallback Values
    FALLBACK_VALUES: {
        indicatorName: 'Sin nombre',
        component: 'Sin categorizar',
        direction: 'No especificado',
        sector: 'No especificado',
        registroAdmin: 'No especificado',
        lastUpdate: 'No disponible',
        periodicity: 'No definido',
        idRA: 'N/A'
    },
    
    // Performance Settings
    DEBOUNCE_DELAY: 300,
    SEARCH_MIN_LENGTH: 2,
    MAX_CHART_ITEMS: 10,
    TABLE_PAGE_SIZE: 50,
    
    // UI Configuration
    NOTIFICATION_DURATION: {
        success: 3000,
        info: 5000,
        warning: 7000,
        error: 10000
    },
    
    // Animation Settings
    LOADING_MIN_DURATION: 500,
    CHART_ANIMATION_DURATION: 750,
    
    // Responsive Breakpoints
    BREAKPOINTS: {
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
    },
    
    // Chart Specific Settings
    CHART_CONFIG: {
        component: {
            type: 'doughnut',
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12 }
                    }
                }
            }
        },
        periodicity: {
            type: 'bar',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 5 }
                }
            }
        }
    },
    
    // Error Messages
    ERROR_MESSAGES: {
        csvNotFound: 'No se pudo cargar el archivo de datos. Verifica que existe "data/indicators.csv".',
        csvInvalid: 'El archivo CSV no tiene el formato esperado.',
        csvEmpty: 'El archivo CSV está vacío o no contiene datos válidos.',
        networkError: 'Error de conexión. Verifica tu conexión a internet.',
        chartError: 'Error al crear los gráficos de visualización.',
        filterError: 'Error al aplicar los filtros.',
        unknownError: 'Se produjo un error inesperado.'
    },
    
    // Success Messages
    SUCCESS_MESSAGES: {
        dataLoaded: 'Datos cargados exitosamente',
        filtersApplied: 'Filtros aplicados correctamente',
        chartsUpdated: 'Gráficos actualizados'
    },
    
    // Field Mapping (for different CSV formats)
    FIELD_MAPPING: {
        indicatorName: ['Nombre_Indicador', 'Indicador', 'N'],
        component: ['Componente', 'Component', 'Comp'],
        direction: ['Direccion', 'Direction', 'Dir'],
        sector: ['SectorE', 'Sector', 'Sector_Estadistico'],
        registroAdmin: ['Registro_Administrativo', 'RA', 'Reg_Admin'],
        idRA: ['Id_RA', 'ID_RA', 'RA_ID', 'RegistroAdministrativo']
    },
    
    // Validation Rules
    VALIDATION: {
        minIndicatorNameLength: 3,
        maxIndicatorNameLength: 200,
        allowEmptyFields: true,
        strictMode: false
    },
    
    // Export Settings
    EXPORT_CONFIG: {
        filename: 'indicadores_sil',
        formats: ['csv', 'json', 'xlsx'],
        includeFilters: true,
        includeTimestamp: true
    },
    
    // Application Metadata
    APP_INFO: {
        name: 'SIL Dashboard',
        version: '1.0.0',
        description: 'Sistema de Información Local - Dashboard de Indicadores',
        organization: 'GADPM - Gobierno Autónomo Descentralizado Provincial de Manabí',
        lastUpdate: '2025-06-04'
    }
};

// Función para obtener configuración específica
CONFIG.get = function(path, defaultValue) {
    defaultValue = defaultValue || null;
    const keys = path.split('.');
    let value = this;
    
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
};

// Función para validar la configuración
CONFIG.validate = function() {
    const required = [
        'CSV_PATH',
        'CHART_COLORS',
        'REQUIRED_COLUMNS',
        'FALLBACK_VALUES'
    ];
    
    const missing = required.filter(function(key) {
        return !(key in this);
    }, this);
    
    if (missing.length > 0) {
        console.error('Configuración incompleta. Faltan:', missing);
        return false;
    }
    
    return true;
};

// Función para obtener colores de gráfico
CONFIG.getChartColors = function(count) {
    const colors = this.CHART_COLORS;
    const result = [];
    
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    
    return result;
};

// Función para obtener configuración responsive
CONFIG.getResponsiveConfig = function() {
    const width = window.innerWidth;
    
    if (width < this.BREAKPOINTS.md) {
        return {
            isMobile: true,
            chartHeight: 250,
            tablePageSize: 25,
            notificationPosition: 'top'
        };
    } else if (width < this.BREAKPOINTS.lg) {
        return {
            isMobile: false,
            chartHeight: 300,
            tablePageSize: 35,
            notificationPosition: 'top-right'
        };
    } else {
        return {
            isMobile: false,
            chartHeight: 300,
            tablePageSize: 50,
            notificationPosition: 'top-right'
        };
    }
};

// Validar configuración al cargar
if (!CONFIG.validate()) {
    console.error('Error en la configuración del sistema');
}

// Hacer disponible globalmente
window.CONFIG = CONFIG;