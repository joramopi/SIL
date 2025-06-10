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

        this.progressLoader = null;
        
        this.chartManager = new ChartManager();
        this.filterManager = new FilterManager();
        window.filterManagerInstance = this.filterManager;
        
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
            // Iniciar barra de progreso basada en tiempo
            if (typeof ProgressLoader !== 'undefined') {
                this.progressLoader = new ProgressLoader();
                this.progressLoader.start();
            }

            // Intentar cargar con diferentes codificaciones
            let csvText = await this.fetchCSVWithEncoding(CONFIG.CSV_PATH);
            
            if (!csvText.trim()) {
                throw new Error(CONFIG.ERROR_MESSAGES.csvEmpty);
            }

            // Parsear datos con corrección de codificación
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
            if (this.progressLoader) {
                this.progressLoader.finish();
            }
            this.setLoadingState(false);
        }
    }

    /**
     * Carga el CSV intentando diferentes codificaciones si es necesario
     */
    async fetchCSVWithEncoding(url) {
        console.log('📂 Cargando archivo CSV:', url);
        
        try {
            // Primer intento: carga normal
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            // Intentar leer como texto UTF-8
            let text = await response.text();
            
            // Verificar si hay caracteres problemáticos que indican mala codificación
            if (this.hasEncodingIssues(text)) {
                console.log('⚠️ Detectados problemas de codificación, intentando corrección...');
                
                // Intentar re-fetch con diferentes configuraciones
                try {
                    const response2 = await fetch(url);
                    const arrayBuffer = await response2.arrayBuffer();
                    
                    // Intentar decodificar como ISO-8859-1 (Latin-1)
                    const decoder = new TextDecoder('iso-8859-1');
                    const altText = decoder.decode(arrayBuffer);
                    
                    if (!this.hasEncodingIssues(altText)) {
                        console.log('✅ Corrección de codificación exitosa con ISO-8859-1');
                        return altText;
                    }
                    
                    // Intentar con Windows-1252
                    const decoder2 = new TextDecoder('windows-1252');
                    const altText2 = decoder2.decode(arrayBuffer);
                    
                    if (!this.hasEncodingIssues(altText2)) {
                        console.log('✅ Corrección de codificación exitosa con Windows-1252');
                        return altText2;
                    }
                    
                } catch (decodingError) {
                    console.warn('⚠️ No se pudo corregir automáticamente la codificación');
                }
            }
            
            console.log('📂 Archivo CSV cargado exitosamente');
            return text;
            
        } catch (error) {
            console.error('❌ Error cargando CSV:', error);
            throw error;
        }
    }

    /**
     * Detecta si hay problemas de codificación en el texto
     */
    hasEncodingIssues(text) {
        // Patrones que indican problemas de codificación
        const problemPatterns = [
            /\uFFFD/g,               // Caracteres de reemplazo
            /Ã[¡-ÿ]/g,             // Secuencias Ã seguidas de caracteres especiales
            /Â[°ª-ÿ]/g,            // Secuencias Â problemáticas
            /â€[œ""']/g             // Comillas y apóstrofes mal codificados
        ];
        
        return problemPatterns.some(pattern => pattern.test(text));
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

            // Inicializar panel ODS
            if (window.ODSPanel) {
                ODSPanel.init(this.state.data, this.filterManager);
            }
            
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

            // Resaltar ODS relacionados
            if (window.ODSPanel) {
                ODSPanel.highlightForData(data);
            }
            
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
                registrosAdmin: this.getUniqueValues(data, 'registroAdmin')
            };

            // Llenar datalists para los filtros con búsqueda
            this.fillDatalist('component-options', uniqueValues.components);
            this.fillDatalist('direction-options', uniqueValues.directions);

            // Solo llenar el filtro de temática si existe el elemento en el HTML
            const themeFilter = DOMUtils.safeQuerySelector('#theme-filter');
            if (themeFilter) {
                this.fillDatalist('theme-options', uniqueValues.registrosAdmin);
            }

            // Proveer opciones originales al FilterManager para la búsqueda
            if (window.filterManagerInstance) {
                window.filterManagerInstance.setFilterOptions('component', uniqueValues.components);
                window.filterManagerInstance.setFilterOptions('direction', uniqueValues.directions);
                window.filterManagerInstance.setFilterOptions('theme', uniqueValues.registrosAdmin);
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
            let value = item[csvField];
            if (value && value.trim() !== '') {
                // Aplicar corrección de codificación
                value = CSVParser.fixEncoding(value.trim());
                values.add(value);
                // Solo mostrar los primeros valores para debug
                if (values.size <= 3) {
                    console.log(`🔍 Debug - Valor encontrado (corregido): "${value}"`);
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
     * Llena un datalist con opciones
     */
    fillDatalist(listId, values) {
        const listElement = DOMUtils.safeQuerySelector(`#${listId}`);
        if (!listElement) return;

        listElement.innerHTML = '';

        values.forEach(value => {
            if (ValidationUtils.isNotEmpty(value)) {
                const option = document.createElement('option');
                option.value = value;
                listElement.appendChild(option);
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
            console.log("✅ Tarjetas de estadísticas actualizadas");
            
            
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
            
            // Reiniciar el mapa de colores para datos filtrados
            this.componentColorMap = null;
            
            if (data.length === 0) {
                this.showEmptyTable();
                return;
            }

            // Limpiar tabla
            tableBody.innerHTML = '';

            // Agregar filas
            const searchTerm = this.filterManager?.getFilterState().search || '';

            data.forEach((indicator, index) => {
                const row = this.createTableRow(indicator, index, searchTerm);
                tableBody.appendChild(row);
            });

            console.log('✅ Tabla actualizada exitosamente con colores consistentes');

        } catch (error) {
            ErrorUtils.handleError(error, 'Actualización de Tabla');
            this.showTableError();
        }
    }

    /**
     * Crea una fila de la tabla
     */
    createTableRow(indicator, index, searchTerm) {
        const row = document.createElement('tr');
        
        // Obtener nombre del indicador con corrección de codificación
        let indicatorName = indicator.Nombre_Indicador || indicator.Indicador || indicator.N || 'Sin nombre';
        indicatorName = CSVParser.fixEncoding(indicatorName);
        
        // Aplicar corrección de codificación a otros campos también
        let component = CSVParser.fixEncoding(indicator.Componente || 'Sin categorizar');
        let direction = CSVParser.fixEncoding(indicator.Direccion || 'No especificado');
        let sector = CSVParser.fixEncoding(indicator.SectorE || 'No especificado');
        
        // Obtener color del componente basado en el índice del componente en la lista de componentes únicos
        const componentColor = this.getComponentColor(component);
        
        // Datos de la fila con corrección de codificación y colores dinámicos
        let registroAdmin = CSVParser.fixEncoding(indicator.Registro_Administrativo || 'N/A');
        const periodicity = this.getPeriodicityForIndex(index);
        const periodicityColor = this.getPeriodicityColor(periodicity);

        if (searchTerm) {
            indicatorName = this.highlightSearchTerm(indicatorName, searchTerm);
            component = this.highlightSearchTerm(component, searchTerm);
            direction = this.highlightSearchTerm(direction, searchTerm);
            sector = this.highlightSearchTerm(sector, searchTerm);
            registroAdmin = this.highlightSearchTerm(registroAdmin, searchTerm);
        }

        const rowData = [
            {
                content: `<strong>${indicatorName}</strong>`,
                isHTML: true
            },
            {
                content: `<span class="badge badge-component" style="background-color: ${componentColor}; color: white;">${component}</span>`,
                isHTML: true
            },
            {
                content: direction,
                isHTML: true
            },
            {
                content: sector,
                isHTML: true
            },
            {
                content: registroAdmin,
                isHTML: true
            },
            {
                content: `<span class="badge badge-periodicity" style="background-color: ${periodicityColor};">${periodicity}</span>`,
                isHTML: true
            },
            {
                content: this.createDashboardLink(indicator.Dashboard),
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
     * Obtiene el color correspondiente para un componente específico
     */
    getComponentColor(componentName) {
        // Obtener todos los componentes únicos para mantener consistencia
        if (!this.componentColorMap) {
            this.componentColorMap = {};
            const uniqueComponents = this.getUniqueValues(this.state.data, 'component');
            
            uniqueComponents.forEach((component, index) => {
                this.componentColorMap[component] = CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length];
            });
        }
        
        return this.componentColorMap[componentName] || CONFIG.CHART_COLORS[0];
    }

    /**
     * Obtiene la periodicidad para un índice (datos de ejemplo)
     */
    getPeriodicityForIndex(index) {
        return CONFIG.PERIODICITIES[index % CONFIG.PERIODICITIES.length];
    }

    /**
     * Obtiene el color asociado a una periodicidad
     */
    getPeriodicityColor(periodicity) {
        const index = CONFIG.PERIODICITIES.indexOf(periodicity);
        return CONFIG.PERIODICITY_COLORS[index >= 0 ? index % CONFIG.PERIODICITY_COLORS.length : 0];
    }

    /**
     * Crea el enlace al dashboard si existe
     */
    createDashboardLink(url) {
        if (url) {
            return `<a href="${url}" class="dashboard-btn" target="_blank" rel="noopener">Ver</a>`;
        }
        return '';
    }

    /**
     * Resalta coincidencias de búsqueda
     */
    highlightSearchTerm(text, term) {
        if (!term) return text;
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    /**
     * Muestra estado vacío en la tabla
     */
    showEmptyTable() {
        const tableBody = DOMUtils.safeQuerySelector('#indicatorsTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
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
                    <td colspan="7" class="empty-state">
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
                    <td colspan="7" class="empty-state">
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

        const footer = DOMUtils.safeQuerySelector('#fivepFooter');
        const imgs = DOMUtils.safeQuerySelectorAll('#fivepCard img');
        imgs.forEach(img => {
            img.addEventListener('click', () => {
                const label = img.getAttribute('data-label') || img.alt || '';
                if (footer) {
                    footer.textContent = label;
                }
            });
        });

        const cardBubble = DOMUtils.safeQuerySelector('#card-bubble');

        function showCardBubble(message) {
            if (!cardBubble) return;
            cardBubble.textContent = message;
            cardBubble.classList.add('show');
        }

        function moveCardBubble(evt) {
            if (!cardBubble) return;
            const left = evt.pageX + 10;
            const top = evt.pageY + 10;
            cardBubble.style.left = `${left}px`;
            cardBubble.style.top = `${top}px`;
        }

        function hideCardBubble() {
            if (cardBubble) cardBubble.classList.remove('show');
        }

        const fivepCard = DOMUtils.safeQuerySelector('#fivepCard');
        if (fivepCard) {
            const moveHandler = evt => moveCardBubble(evt);
            fivepCard.addEventListener('mouseenter', evt => {
                showCardBubble('Espacio destinado a las 5P');
                moveCardBubble(evt);
                fivepCard.addEventListener('mousemove', moveHandler);
            });
            fivepCard.addEventListener('mouseleave', () => {
                hideCardBubble();
                fivepCard.removeEventListener('mousemove', moveHandler);
            });
        }

        const epdotFooter = DOMUtils.safeQuerySelector('#fiveepdotFooter');
        const epdotImgs = DOMUtils.safeQuerySelectorAll('#fiveepdotCard img');
        epdotImgs.forEach(img => {
            img.addEventListener('click', () => {
                const label = img.getAttribute('data-label') || img.alt || '';
                if (epdotFooter) {
                    epdotFooter.textContent = label;
                }
            });
        });

        const fiveepdotCard = DOMUtils.safeQuerySelector('#fiveepdotCard');
        if (fiveepdotCard) {
            const moveEpdotHandler = evt => moveCardBubble(evt);
            fiveepdotCard.addEventListener('mouseenter', evt => {
                showCardBubble('Cinco Ejes del PDOT');
                moveCardBubble(evt);
                fiveepdotCard.addEventListener('mousemove', moveEpdotHandler);
            });
            fiveepdotCard.addEventListener('mouseleave', () => {
                hideCardBubble();
                fiveepdotCard.removeEventListener('mousemove', moveEpdotHandler);
            });
        }

    } catch (error) {
        ErrorUtils.handleError(error, 'Inicialización del Sistema');
    }
});

// Exportar para uso en otros módulos
window.Dashboard = Dashboard
