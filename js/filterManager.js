// js/filterManager.js

/**
 * Clase para gestionar todos los filtros del dashboard
 */
class FilterManager {
    constructor() {
        this.filters = {
        periodicity: '',
            component: '',
            periodicity: "Filtra por periodicidad de actualización",
            direction: '',
            sector: '',
            search: ''
        };
        
        this.originalData = [];
        this.onFilterChange = null;
        this.isSetup = false;
        
        // Elementos del DOM
        this.elements = {};
    }

    /**
     * Configura el sistema de filtros
     */
    setup(onFilterChangeCallback) {
        console.log("🎛️ Configurando sistema de filtros...");
        
        try {
            this.onFilterChange = onFilterChangeCallback;
            
            // Obtener elementos del DOM
            this.getFilterElements();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar comportamientos especiales
            this.setupSpecialBehaviors();
            
            this.isSetup = true;
            console.log("✅ Sistema de filtros configurado exitosamente");
            
        } catch (error) {
            ErrorUtils.handleError(error, 'Configuración de Filtros');
        }
    }

    /**
     * Obtiene referencias a los elementos de filtro del DOM
     */
    getFilterElements() {
        this.elements = {
            component: DOMUtils.safeQuerySelector('#component-filter'),
            periodicity: "Filtra por periodicidad de actualización",
            periodicity: DOMUtils.safeQuerySelector('#periodicity-filter'),
            direction: DOMUtils.safeQuerySelector('#direction-filter'),
            sector: DOMUtils.safeQuerySelector('#sector-filter'),
            search: DOMUtils.safeQuerySelector('#search-input')
        };

        // Verificar si existe el filtro de temática (opcional)
        const themeFilter = DOMUtils.safeQuerySelector('#theme-filter');
        if (themeFilter) {
            this.elements.theme = themeFilter;
            this.filters.theme = '';
        }

        // Verificar que todos los elementos existan
        const missingElements = Object.entries(this.elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            console.warn(`⚠️ Elementos de filtro faltantes: ${missingElements.join(', ')}`);
        }
    }

    /**
     * Configura los event listeners para todos los filtros
     */
    setupEventListeners() {
        // Filtros select
        ['component','periodicity','direction','sector','theme'].forEach(filterType => {
            const element = this.elements[filterType];
            if (element) {
                element.addEventListener('change', (e) => {
                    this.handleFilterChange(filterType, e.target.value);
                });
            }
        });

        // Filtro de búsqueda con debounce y longitud mínima
        if (this.elements.search) {
            const debouncedSearch = PerformanceUtils.debounce(
                (value) => {
                    if (value.length >= CONFIG.SEARCH_MIN_LENGTH) {
                        this.handleFilterChange('search', value);
                    } else if (value.length === 0) {
                        this.handleFilterChange('search', '');
                    }
                },
                CONFIG.DEBOUNCE_DELAY
            );

            this.elements.search.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });

            // También escuchar eventos de teclado para mejor UX
            this.elements.search.addEventListener('keyup', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });
        }
    }

    /**
     * Configura comportamientos especiales de los filtros
     */
    setupSpecialBehaviors() {
        // Placeholder dinámico para búsqueda
        if (this.elements.search) {
            const placeholders = [
                'Ejemplo: Mortalidad infantil',
                'Busca por tema o palabra clave',
                'Filtra indicadores aquí...'
            ];
            
            let currentIndex = 0;
            setInterval(() => {
                if (this.elements.search && !this.elements.search.value) {
                    this.elements.search.placeholder = placeholders[currentIndex];
                    currentIndex = (currentIndex + 1) % placeholders.length;
                }
            }, 3000);
        }

        // Tooltip para filtros
        this.addFilterTooltips();
    }

    /**
     * Añade tooltips informativos a los filtros
     */
    addFilterTooltips() {
        const tooltips = {
            component: 'Filtra indicadores por componente del PDOT',
            periodicity: "Filtra por periodicidad de actualización",
            direction: 'Filtra por dirección responsable',
            sector: 'Filtra por sector estadístico',
            theme: 'Filtra por temática',
            search: 'Busca en nombres y descripciones de indicadores'
        };

        Object.entries(tooltips).forEach(([filterType, tooltip]) => {
            const element = this.elements[filterType];
            if (element) {
                element.title = tooltip;
                element.setAttribute('aria-describedby', `${filterType}-tooltip`);
            }
        });
    }

    /**
     * Maneja el cambio de cualquier filtro
     */
    handleFilterChange(filterType, value) {
        try {
            // Actualizar el estado del filtro
            this.filters[filterType] = value;

            // Log del cambio para debugging
            console.log(`🔍 Filtro ${filterType} cambiado a: "${value}"`);
            console.log('🔍 Estado actual de filtros:', this.filters);

            // Aplicar filtros
            this.applyFilters();

            // Actualizar UI relacionada
            this.updateFilterUI(filterType, value);

        } catch (error) {
            ErrorUtils.handleError(error, `Cambio de filtro ${filterType}`);
        }
    }

    /**
     * Aplica todos los filtros activos a los datos
     */
    applyFilters() {
        if (!this.originalData.length) {
            console.warn('⚠️ No hay datos originales para filtrar');
            return;
        }

        const timer = PerformanceUtils.measureTime('Aplicación de filtros');

        try {
            console.log('🔍 Aplicando filtros:', this.filters);
            
            // Filtrar datos
            const filteredData = this.filterData(this.originalData, this.filters);
            
            console.log(`✅ Filtros aplicados: ${filteredData.length} de ${this.originalData.length} registros`);

            // Notificar cambio
            if (this.onFilterChange) {
                this.onFilterChange(filteredData);
            } else {
                console.warn('⚠️ No hay callback configurado para onFilterChange');
            }

            // Actualizar contador de resultados y filtros activos
            this.updateResultsCounter(filteredData.length);
            this.updateActiveFilterCount();

            // Anunciar cambios para accesibilidad
            AccessibilityUtils.announceToScreenReader(
                `Filtros aplicados: ${filteredData.length} indicadores encontrados`
            );

            timer.end();

        } catch (error) {
            ErrorUtils.handleError(error, 'Aplicación de Filtros');
        }
    }

    /**
     * Filtra los datos según los criterios activos
     */
    filterData(data, filters) {
        return data.filter(item => {
            // Filtro de componente
            // Filtro de periodicidad
            if (filters.periodicity && filters.periodicity !== "") {
                const itemPer = item.periodicity || "";
                if (itemPer !== filters.periodicity) return false;
            }
            if (filters.component && filters.component !== '') {
                const itemComponent = DataUtils.getFieldValue(item, 'component');
                if (itemComponent !== filters.component) return false;
            }

            // Filtro de dirección
            if (filters.direction && filters.direction !== '') {
                const itemDirection = DataUtils.getFieldValue(item, 'direction');
                if (itemDirection !== filters.direction) return false;
            }

            // Filtro de temática (solo si existe)
            if (filters.theme && filters.theme !== '' && this.elements.theme) {
                const itemTheme = DataUtils.getFieldValue(item, 'registroAdmin');
                if (itemTheme !== filters.theme) return false;
            }

            // Filtro de sector
            if (filters.sector && filters.sector !== '') {
                const itemSector = DataUtils.getFieldValue(item, 'sector');
                if (itemSector !== filters.sector) return false;
            }

            // Filtro de búsqueda
            if (filters.search && filters.search.trim() !== '') {
                const searchTerm = filters.search.toLowerCase().trim();
                
                // Buscar en múltiples campos
                const searchableFields = [
                    DataUtils.getIndicatorName(item),
                    DataUtils.getFieldValue(item, 'component'),
                    DataUtils.getFieldValue(item, 'direction'),
                    DataUtils.getFieldValue(item, 'sector'),
                    DataUtils.getFieldValue(item, 'registroAdmin'),
                    DataUtils.getFieldValue(item, 'idRA')
                ];

                const matchFound = searchableFields.some(field => 
                    field.toLowerCase().includes(searchTerm)
                );

                if (!matchFound) return false;
            }

            return true;
        });
    }

    /**
     * Actualiza la UI relacionada con un filtro específico
     */
    updateFilterUI(filterType, value) {
        const element = this.elements[filterType];
        if (!element) return;

        // Añadir clase visual para filtros activos
        if (value && value.trim() !== '') {
            element.classList.add('filter-active');
        } else {
            element.classList.remove('filter-active');
        }

        // Efecto visual especial para búsqueda
        if (filterType === 'search') {
            this.updateSearchUI(value);
        }
    }

    /**
     * Actualiza la UI específica de búsqueda
     */
    updateSearchUI(searchValue) {
        const searchContainer = this.elements.search?.parentElement;
        if (!searchContainer) return;

        if (searchValue && searchValue.trim() !== '') {
            searchContainer.classList.add('search-active');
            
            // Añadir botón de limpiar si no existe
            if (!searchContainer.querySelector('.search-clear')) {
                this.addClearSearchButton(searchContainer);
            }
        } else {
            searchContainer.classList.remove('search-active');
            
            // Remover botón de limpiar
            const clearButton = searchContainer.querySelector('.search-clear');
            if (clearButton) {
                clearButton.remove();
            }
        }
    }

    /**
     * Añade botón para limpiar búsqueda
     */
    addClearSearchButton(container) {
        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear';
        clearButton.innerHTML = '<i class="fas fa-times"></i>';
        clearButton.setAttribute('aria-label', 'Limpiar búsqueda');
        clearButton.setAttribute('type', 'button');
        
        clearButton.style.cssText = `
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--dark-gray);
            cursor: pointer;
            font-size: 0.9rem;
            opacity: 0.7;
            z-index: 10;
        `;

        clearButton.addEventListener('click', () => this.clearSearch());
        clearButton.addEventListener('mouseenter', () => clearButton.style.opacity = '1');
        clearButton.addEventListener('mouseleave', () => clearButton.style.opacity = '0.7');

        container.appendChild(clearButton);
    }

    /**
     * Actualiza el contador de resultados
     */
    updateResultsCounter(count) {
        // Buscar o crear elemento contador
        let counter = DOMUtils.safeQuerySelector('.results-counter');
        
        if (!counter) {
            counter = this.createResultsCounter();
        }

        if (counter) {
            const total = this.originalData.length;
            counter.textContent = `Mostrando ${FormatUtils.formatNumber(count)} de ${FormatUtils.formatNumber(total)} indicadores`;
        }
    }

    /**
     * Actualiza el número de filtros activos
     */
    updateActiveFilterCount() {
        const countElem = DOMUtils.safeQuerySelector('#activeFiltersCount');
        if (!countElem) return;

        const active = this.getFilterStats().activeFilters;
        countElem.textContent = active > 0 ? `${active} filtro(s) activo(s)` : 'Sin filtros activos';
    }

    /**
     * Crea el elemento contador de resultados
     */
    createResultsCounter() {
        const searchSection = DOMUtils.safeQuerySelector('.table-search-section');
        if (!searchSection) return null;

        const counter = document.createElement('div');
        counter.className = 'results-counter';

        searchSection.appendChild(counter);
        return counter;
    }

    /**
     * Limpia la búsqueda
     */
    clearSearch() {
        if (this.elements.search) {
            this.elements.search.value = '';
            this.handleFilterChange('search', '');
            this.elements.search.focus();
        }
    }

    /**
     * Limpia todos los filtros
     */
    clearAllFilters() {
        console.log("🧹 Limpiando todos los filtros...");

        try {
            // Resetear valores de filtros
            Object.keys(this.filters).forEach(filterType => {
                this.filters[filterType] = '';
                
                const element = this.elements[filterType];
                if (element) {
                    if (element.tagName === 'SELECT') {
                        element.selectedIndex = 0;
                    } else {
                        element.value = '';
                    }
                    element.classList.remove('filter-active');
                }
            });

            // Aplicar filtros (que ahora están vacíos)
            this.applyFilters();
            this.updateActiveFilterCount();

            // Limpiar UI de búsqueda
            this.updateSearchUI('');

            NotificationManager.show('Todos los filtros han sido limpiados', 'info');

        } catch (error) {
            ErrorUtils.handleError(error, 'Limpieza de Filtros');
        }
    }

    /**
     * Establece los datos originales para filtrar
     */
    setData(data) {
        this.originalData = data;
        console.log(`📊 Datos establecidos para filtros: ${data.length} registros`);
        
        // Aplicar filtros iniciales (sin filtros activos, debería devolver todos los datos)
        if (this.isSetup && this.onFilterChange) {
            console.log('🔄 Aplicando filtros iniciales después de setData');
            this.applyFilters();
        }
    }

    /**
     * Obtiene el estado actual de los filtros
     */
    getFilterState() {
        return { ...this.filters };
    }

    /**
     * Establece el estado de los filtros
     */
    setFilterState(filters) {
        Object.entries(filters).forEach(([filterType, value]) => {
            const element = this.elements[filterType];
            if (element) {
                if (element.tagName === 'SELECT') {
                    element.value = value;
                } else {
                    element.value = value;
                }
                this.handleFilterChange(filterType, value);
            }
        });
    }

    /**
     * Verifica si hay filtros activos
     */
    hasActiveFilters() {
        return Object.values(this.filters).some(value => value && value.trim() !== '');
    }

    /**
     * Obtiene estadísticas de filtros
     */
    getFilterStats() {
        const activeFilters = Object.entries(this.filters)
            .filter(([, value]) => value && value.trim() !== '')
            .length;

        return {
            totalFilters: Object.keys(this.filters).length,
            activeFilters,
            hasActiveFilters: activeFilters > 0,
            originalDataCount: this.originalData.length,
            currentSearchTerm: this.filters.search
        };
    }

    /**
     * Exporta la configuración actual de filtros
     */
    exportFilterConfig() {
        const config = {
            filters: this.getFilterState(),
            timestamp: new Date().toISOString(),
            stats: this.getFilterStats()
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sil_filters_${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
        NotificationManager.show('Configuración de filtros exportada', 'success');
    }

    /**
     * Destruye el gestor de filtros
     */
    destroy() {
        // Remover event listeners
        Object.values(this.elements).forEach(element => {
            if (element) {
                element.removeEventListener('change', this.handleFilterChange);
                element.removeEventListener('input', this.handleFilterChange);
            }
        });

        // Limpiar estado
        this.filters = {};
        periodicity: '',
        this.originalData = [];
        this.onFilterChange = null;
        this.elements = {};
        this.isSetup = false;

        console.log("🗑️ Gestor de filtros destruido");
    }
}

// Hacer disponible globalmente
window.FilterManager = FilterManager;