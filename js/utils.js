import { CONFIG } from './config.js';

/**
 * Utilidades generales para el dashboard
 */
export class Utils {
    
    /**
     * Función debounce para optimizar eventos
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Función throttle para limitar frecuencia de eventos
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    /**
     * Selección segura de elementos DOM
     */
    static safeQuerySelector(selector, context = document) {
        try {
            const element = context.querySelector(selector);
            if (!element) {
                console.warn(`Elemento '${selector}' no encontrado`);
                return this.createFallbackElement();
            }
            return element;
        } catch (error) {
            console.error(`Error al buscar elemento '${selector}':`, error);
            return this.createFallbackElement();
        }
    }

    /**
     * Crear elemento fallback cuando no se encuentra el original
     */
    static createFallbackElement() {
        const div = document.createElement('div');
        div.className = 'fallback-element';
        div.style.display = 'none';
        div.textContent = '0'; // Valor por defecto para estadísticas
        return div;
    }

    /**
     * Obtener nombre del indicador con fallbacks
     */
    static getIndicatorName(indicator) {
        return indicator.Nombre_Indicador || 
               indicator['Descripción IN'] || 
               indicator.N || 
               indicator.Descripcion ||
               CONFIG.FALLBACK_VALUES.indicatorName;
    }

    /**
     * Formatear números para display
     */
    static formatNumber(number) {
        if (typeof number !== 'number') return '0';
        return new Intl.NumberFormat('es-ES').format(number);
    }

    /**
     * Generar ID único
     */
    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validar estructura de datos CSV
     */
    static validateCSVData(data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Los datos deben ser un array no vacío');
        }

        const firstRow = data[0];
        const missingColumns = CONFIG.REQUIRED_COLUMNS.filter(
            col => !firstRow.hasOwnProperty(col)
        );

        if (missingColumns.length > 0) {
            console.warn(`Columnas faltantes: ${missingColumns.join(', ')}`);
        }

        return {
            isValid: missingColumns.length === 0,
            missingColumns,
            rowCount: data.length
        };
    }

    /**
     * Crear elemento de carga
     */
    static createLoadingElement() {
        const loading = document.createElement('div');
        loading.className = 'loading-spinner';
        loading.innerHTML = `
            <div class="spinner"></div>
            <span>Cargando datos...</span>
        `;
        return loading;
    }

    /**
     * Limpiar texto para búsqueda
     */
    static normalizeText(text) {
        if (typeof text !== 'string') return '';
        return text.toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '') // Remover acentos
                  .trim();
    }

    /**
     * Descargar datos como CSV
     */
    static downloadCSV(data, filename) {
        if (!data || data.length === 0) {
            console.warn('No hay datos para exportar');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(';'),
            ...data.map(row => headers.map(header => 
                `"${(row[header] || '').toString().replace(/"/g, '""')}"`
            ).join(';'))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { 
            type: 'text/csv;charset=utf-8;' 
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    /**
     * Mostrar/ocultar elementos de carga
     */
    static toggleLoading(elements, isLoading) {
        const elementsArray = Array.isArray(elements) ? elements : [elements];
        elementsArray.forEach(element => {
            if (element) {
                element.classList.toggle('loading', isLoading);
                element.style.pointerEvents = isLoading ? 'none' : 'auto';
            }
        });
    }
}
