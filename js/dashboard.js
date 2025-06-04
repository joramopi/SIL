// js/dashboard.js

/**
 * Clase principal del Dashboard
 * Coordina todos los componentes del sistema
 */
class Dashboard {
    constructor() {
        this.state = {
            data: [],
            filteredData: [],
            isLoading: false,
            error: null
        };
        
        this.chartManager = new ChartManager();
        this.filterManager = new FilterManager();
        
        this.init();
    }

    /**
     * Inicializa el dashboard
     */
    async init() {
        console.log("🚀 Iniciando Dashboard SIL...");
        
        try {
            // Configurar manejadores de errores globales
            this.setupErrorHandlers();
            
            // Cargar y procesar datos
            await this.loadData();
            
            // Inicializar componentes
            this.initializeComponents();
            
            console.log("✅ Dashboard inicializado exitosamente");
            
        } catch (error) {
            ErrorUtils.handleError(error, 'Inicialización del Dashboard');
        }
    }

    /**
     * Configura manejadores de errores globales
     */
    setupErrorHandlers() {
        // Error global de JavaScript
        window.addEventListener('error', (event) => {
            ErrorUtils.handleError(event.error, 'Error Global');
        });

        // Error de promesas no capturadas
        window.addEventListener('unhandledrejection', (event) => {
            ErrorUtils.handleError(event.reason, 'Promesa Rechazada');
        });
    }

    /**
     * Carga los datos desde el archivo CSV
     */
    async loadData() {
        const timer = PerformanceUtils.measureTime('Carga de datos');
        this.setLoadingState(true);

        try {
            NotificationManager.show('Cargando datos de indicadores...', 'info', 2000);

            const response = await fetch(CONFIG.CSV_PATH);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const csvText = await response.text();
            
            if (!csvText.trim()) {
                throw new Error(CONFIG.ERROR_MESSAGES.csvEmpty);
            }

            // Parsear datos
            this.state.data = CSVParser.parse(csvText);
            
            console.log('🔍 Debug - Primeros 3 registros parseados:', this.state.data.slice(0, 3));
            console.log('🔍 Debug - Columnas detectadas:', Object.keys(this.state.data[0] || {}));
            
            if (this.state.data.length === 0) {
                throw new Error(CONFIG.ERROR_MESSAGES.csvEmpty);
            }

            // Validar estructura de datos
            const validation = ValidationUtils.validateCSVData(this.state.data);
            if (!validation.valid) {
                console.warn('⚠️ Datos con problemas:', validation.error);
                NotificationManager.show(`Advertencia: ${validation.error}`, 'warning');
            }

            this.state.filteredData = [...this.state.data];
            
            NotificationManager.show(
                `${CONFIG.SUCCESS_MESSAGES.dataLoaded}: ${this.state.data.length} indicadores`,
                'success'
            );

            timer.end();

        } catch (error) {
            this.state.error = error;
            
            // Mostrar error específico según el tipo
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                ErrorUtils.handleError(new Error(CONFIG.ERROR_MESSAGES.csvNotFound), 'Carga de Datos');
            } else {
                ErrorUtils.handleError(error, 'Carga de Datos');
            }
            
            this.showErrorState();
            
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Inicializa todos los componentes del dashboard
     */
    initializeComponents() {
        if (this.state.data.length === 0) {
            console.warn('No hay datos para inicializar componentes');
            return;
        }

        try {
            // Poblar filtros
            this.populateFilters();
            
            // IMPORTANTE: Establecer los datos en el FilterManager ANTES de configurarlo
            this.filterManager.setData(this.state.data);
            
            // Configurar sistema de filtros
            this.filterManager.setup((filteredData) => {
                console.log(`🔍 Filtros aplicados: ${filteredData.length} de ${this.state.data.length} registros`);
                this.state.filteredData = filteredData;
                this.updateDashboard();
            });
            
            // Inicializar gráficos
            this.chartManager.initialize();
            
            // Actualizar dashboard inicial
            this.updateDashboard();
            
        } catch (error) {
            ErrorUtils.handleError(error, 'Inicialización de Componentes');
        }
    }

    /**
     * Actualiza todo el dashboard con los datos filtrados
     */
    updateDashboard() {
        const timer = PerformanceUtils.measureTime('Actualización del dashboard');
        
        try {
            const data = this.state.filteredData;
            console.log(`📊 Actualizando dashboard con ${data.length} registros filtrados`);
            
            // Actualizar estadísticas
            this.updateStatsCards(data);
            
            // Actualizar tabla
            this.updateTable(data);
            
            // Actualizar gráficos
            this.chartManager.updateCharts(data);
            
            // Anunciar cambios para accesibilidad
            AccessibilityUtils.announceToScreenReader(
                `Dashboard actualizado con ${data.length} indicadores`
            );
            
            timer.end();
            
        } catch (error) {
            ErrorUtils.handleError(error, 'Actualización del Dashboard');
        }
    }

    /**
     * Puebla los filtros con datos únicos
     */
    populateFilters() {
        console.log("🎛️ Poblando filtros...");
        
        try {
            const data = this.state.data;
            
            // Obtener valores únicos para cada filtro
            const uniqueValues = {
                components: this.getUniqueValues(data, 'component'),
                directions: this.getUniqueValues(data, 'direction'),
                sectors: this.getUniqueValues(data, 'sector'),
                registrosAdmin: this.getUniqueValues(data, 'registroAdmin')
            };

            // Llenar cada select
            this.fillSelect('component-filter', uniqueValues.components, 'Todos los componentes');
            this.fillSelect('direction-filter', uniqueValues.directions, 'Todas las direcciones');
            this.fillSelect('sector-filter', uniqueValues.sectors, 'Todos los sectores');
            
            // Solo llenar el filtro de temática si existe el elemento en el HTML
            const themeFilter = DOMUtils.safeQuerySelector('#theme-filter');
            if (themeFilter) {
                // Para el filtro de temática, podemos usar los registros administrativos
                this.fillSelect('theme-filter', uniqueValues.registrosAdmin, 'Todos los registros administrativos');
            }

            console.log(`✅ Filtros poblados exitosamente`);
            
        } catch (error) {
            ErrorUtils.handleError(error, 'Poblado de Filtros');
        }
    }

    /**
     * Obtiene valores únicos para un campo específico
     */
    getUniqueValues(data, fieldMapping) {
        const values = new Set();
        
        // Mapeo directo a las columnas reales del CSV
        const fieldMap = {
            'component': 'Componente',
            'direction': 'Direccion', 
            'sector': 'SectorE',
            'registroAdmin': 'Registro_Administrativo'
        };
        
        const csvField = fieldMap[fieldMapping] || fieldMapping;
        console.log(`🔍 Debug getUniqueValues - Buscando campo: ${csvField} para ${fieldMapping}`);
        
        data.forEach(item => {
            const value = item[csvField];
            if (value && value.trim() !== '') {
                values.add(value.trim());
                // Solo mostrar los primeros valores para debug
                if (values.size <= 3) {
                    console.log(`🔍 Debug - Valor encontrado: "${value}"`);
                }
            }
        });
        
        const uniqueArray = Array.from(values).sort();
        console.log(`🔍 Debug getUniqueValues - Campo: ${fieldMapping} (${csvField}), Total valores únicos: ${uniqueArray.length}`);
        console.log(`🔍 Debug getUniqueValues - Primeros valores: `, uniqueArray.slice(0, 5));
        
        return uniqueArray;
    }

    /**
     * Llena un select con opciones
     */
    fillSelect(selectId, values, defaultText) {
        const selectElement = DOMUtils.safeQuerySelector(`#${selectId}`);
        if (!selectElement) return;

        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        
        values.forEach(value => {
            if (ValidationUtils.isNotEmpty(value)) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                selectElement.appendChild(option);
            }
        });
    }

    /**
     * Actualiza las tarjetas de estadísticas
     */
    updateStatsCards(data) {
        try {
            console.log(`📊 Actualizando estadísticas con ${data.length} registros`);
            
            const stats = this.calculateStats(data);
            
            console.log('📊 Estadísticas calculadas:', stats);
            
            // Actualizar cada tarjeta
            DOMUtils.safeSetContent('#totalIndicatorsCard .stat-value', FormatUtils.formatNumber(stats.total));
            DOMUtils.safeSetContent('#registrosCard .stat-value', FormatUtils.formatNumber(stats.uniqueRAs));
            DOMUtils.safeSetContent('#componentsCard .stat-value', FormatUtils.formatNumber(stats.uniqueComponents));
            
            // Actualizar fecha de actualización
            const currentDate = new Date();
            const monthName = FormatUtils.formatDate(currentDate, { month: 'long' });
            DOMUtils.safeSetContent('#updateCard .stat-value', FormatUtils.capitalizeWords(monthName));
            
            console.log('✅ Tarjetas de estadísticas actualizadas');
            
        } catch (error) {
            ErrorUtils.handleError(error, 'Actualización de Estadísticas');
        }
    }

    /**
     * Calcula estadísticas de los datos
     */
    calculateStats(data) {
        const uniqueRAs = new Set();
        const uniqueComponents = new Set();
        const uniqueDirections = new Set();
        const uniqueSectors = new Set();

        data.forEach(item => {
            // Acceso directo a las columnas del CSV
            if (item.Id_RA && item.Id_RA.trim() !== '') {
                uniqueRAs.add(item.Id_RA.trim());
            }
            if (item.Componente && item.Componente.trim() !== '') {
                uniqueComponents.add(item.Componente.trim());
            }
            if (item.Direccion && item.Direccion.trim() !== '') {
                uniqueDirections.add(item.Direccion.trim());
            }
            if (item.SectorE && item.SectorE.trim() !== '') {
                uniqueSectors.add(item.SectorE.trim());
            }
        });

        console.log('📊 Debug Stats - RAs únicos:', uniqueRAs.size, Array.from(uniqueRAs).slice(0, 3));
        console.log('📊 Debug Stats - Componentes únicos:', uniqueComponents.size, Array.from(uniqueComponents));

        return {
            total: data.length,
            uniqueRAs: uniqueRAs.size,
            uniqueComponents: uniqueComponents.size,
            uniqueDirections: uniqueDirections.size,
            uniqueSectors: uniqueSectors.size
        };
    }

    /**
     * Actualiza la tabla de indicadores
     */
    updateTable(data) {
        const tableBody = DOMUtils.safeQuerySelector('#indicatorsTableBody');
        if (!tableBody) return;

        try {
            console.log(`📋 Actualizando tabla con ${data.length} registros`);
            
            if (data.length === 0) {
                this.showEmptyTable();
                return;
            }

            // Limpiar tabla
            tableBody.innerHTML = '';

            // Agregar filas
            data.forEach((indicator, index) => {
                const row = this.createTableRow(indicator, index);
                tableBody.appendChild(row);
            });

            console.log('✅ Tabla actualizada exitosamente');

        } catch (error) {
            ErrorUtils.handleError(error, 'Actualización de Tabla');
            this.showTableError();
        }
    }

    /**
     * Crea una fila de la tabla
     */
    createTableRow(indicator, index) {
        const row = document.createElement('tr');
        
        // Obtener nombre del indicador
        const indicatorName = indicator.Nombre_Indicador || indicator.Indicador || indicator.N || 'Sin nombre';
        
        // Datos de la fila con acceso directo a las columnas
        const rowData = [
            {
                content: `<strong>${indicatorName}</strong>`,
                isHTML: true
            },
            {
                content: `<span class="badge badge-primary">${indicator.Componente || 'Sin categorizar'}</span>`,
                isHTML: true
            },
            {
                content: indicator.Direccion || 'No especificado'
            },
            {
                content: indicator.SectorE || 'No especificado'
            },
            {
                content: indicator.Id_RA || 'N/A'
            },
            {
                content: `<span class="badge badge-success">${this.getPeriodicityForIndex(index)}</span>`,
                isHTML: true
            }
        ];

        // Crear celdas
        rowData.forEach(cellData => {
            const cell = row.insertCell();
            if (cellData.isHTML) {
                cell.innerHTML = cellData.content;
            } else {
                cell.textContent = cellData.content;
            }
        });

        return row;
    }

    /**
     * Obtiene la periodicidad para un índice (datos de ejemplo)
     */
    getPeriodicityForIndex(index) {
        return CONFIG.PERIODICITIES[index % CONFIG.PERIODICITIES.length];
    }

    /**
     * Muestra estado vacío en la tabla
     */
    showEmptyTable() {
        const tableBody = DOMUtils.safeQuerySelector('#indicatorsTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No se encontraron indicadores que coincidan con los filtros aplicados</p>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * Muestra error en la tabla
     */
    showTableError() {
        const tableBody = DOMUtils.safeQuerySelector('#indicatorsTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i>
                        <p>Error al cargar los datos de la tabla</p>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * Muestra estado de error general
     */
    showErrorState() {
        const tableBody = DOMUtils.safeQuerySelector('#indicatorsTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i>
                        <p>Error al cargar los datos: ${this.state.error?.message || 'Error desconocido'}</p>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem;">
                            Verifica que el archivo 'data/indicators.csv' exista y sea accesible.
                        </p>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * Controla el estado de carga
     */
    setLoadingState(isLoading) {
        this.state.isLoading = isLoading;
        
        const overlay = DOMUtils.safeQuerySelector('#loadingOverlay');
        if (overlay) {
            overlay.style.display = isLoading ? 'flex' : 'none';
        }

        // Aplicar estado de carga a las tarjetas
        const cards = DOMUtils.safeQuerySelectorAll('.stat-card, .chart-card');
        cards.forEach(card => {
            if (isLoading) {
                card.classList.add('loading-card');
            } else {
                card.classList.remove('loading-card');
            }
        });
    }

    /**
     * Obtiene los datos actuales
     */
    getData() {
        return this.state.data;
    }

    /**
     * Obtiene los datos filtrados
     */
    getFilteredData() {
        return this.state.filteredData;
    }

    /**
     * Recarga los datos
     */
    async reload() {
        console.log("🔄 Recargando dashboard...");
        this.state.data = [];
        this.state.filteredData = [];
        this.state.error = null;
        
        await this.loadData();
        
        if (this.state.data.length > 0) {
            this.initializeComponents();
        }
    }
}

// Instancia global del dashboard
let dashboardInstance = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log("📄 DOM cargado, inicializando dashboard...");
    
    try {
        dashboardInstance = new Dashboard();
        
        // Hacer la instancia disponible globalmente para debugging
        window.dashboard = dashboardInstance;
        
    } catch (error) {
        ErrorUtils.handleError(error, 'Inicialización del Sistema');
    }
});

// Exportar para uso en otros módulos
window.Dashboard = Dashboard;