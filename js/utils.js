// js/utils.js

/**
 * Utilidades DOM seguras
 */
const DOMUtils = {
    /**
     * Selecciona un elemento de forma segura
     */
    safeQuerySelector(selector, context = document) {
        try {
            const element = context.querySelector(selector);
            if (!element) {
                console.warn(`Elemento '${selector}' no encontrado`);
            }
            return element;
        } catch (error) {
            console.error(`Error al buscar elemento '${selector}':`, error);
            return null;
        }
    },

    /**
     * Selecciona múltiples elementos de forma segura
     */
    safeQuerySelectorAll(selector, context = document) {
        try {
            const elements = context.querySelectorAll(selector);
            if (elements.length === 0) {
                console.warn(`No se encontraron elementos con selector '${selector}'`);
            }
            return Array.from(elements);
        } catch (error) {
            console.error(`Error al buscar elementos '${selector}':`, error);
            return [];
        }
    },

    /**
     * Establece el contenido de un elemento de forma segura
     */
    safeSetContent(selector, content, isHTML = false) {
        const element = this.safeQuerySelector(selector);
        if (element) {
            if (isHTML) {
                element.innerHTML = content;
            } else {
                element.textContent = content;
            }
            return true;
        }
        return false;
    },

    /**
     * Añade una clase de forma segura
     */
    safeAddClass(selector, className) {
        const element = this.safeQuerySelector(selector);
        if (element) {
            element.classList.add(className);
            return true;
        }
        return false;
    },

    /**
     * Remueve una clase de forma segura
     */
    safeRemoveClass(selector, className) {
        const element = this.safeQuerySelector(selector);
        if (element) {
            element.classList.remove(className);
            return true;
        }
        return false;
    }
};

/**
 * Utilidades de validación
 */
const ValidationUtils = {
    /**
     * Valida si un valor no está vacío
     */
    isNotEmpty(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    /**
     * Valida si un string es válido
     */
    isValidString(value, minLength = 1, maxLength = Infinity) {
        if (typeof value !== 'string') return false;
        const length = value.trim().length;
        return length >= minLength && length <= maxLength;
    },

    /**
     * Valida si un número es válido
     */
    isValidNumber(value, min = -Infinity, max = Infinity) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    /**
     * Valida si un array es válido
     */
    isValidArray(value, minLength = 0) {
        return Array.isArray(value) && value.length >= minLength;
    },

    /**
     * Sanitiza un string para uso seguro
     */
    sanitizeString(value) {
        if (typeof value !== 'string') return '';
        return value.trim().replace(/[<>\"']/g, '');
    },

    /**
     * Valida estructura de datos CSV
     */
    validateCSVData(data) {
        if (!this.isValidArray(data, 1)) {
            return { valid: false, error: 'Datos vacíos o inválidos' };
        }

        const requiredColumns = CONFIG.REQUIRED_COLUMNS;
        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
            return { 
                valid: false, 
                error: `Columnas faltantes: ${missingColumns.join(', ')}` 
            };
        }

        return { valid: true };
    }
};

/**
 * Utilidades de formato
 */
const FormatUtils = {
    /**
     * Formatea un número con separadores de miles
     */
    formatNumber(number, locale = 'es-ES') {
        if (!ValidationUtils.isValidNumber(number)) return '0';
        return new Intl.NumberFormat(locale).format(number);
    },

    /**
     * Formatea una fecha
     */
    formatDate(date, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        return new Intl.DateTimeFormat('es-ES', options).format(date);
    },

    /**
     * Trunca un texto a una longitud específica
     */
    truncateText(text, maxLength = 50, suffix = '...') {
        if (typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    },

    /**
     * Capitaliza la primera letra de cada palabra
     */
    capitalizeWords(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/\b\w/g, letter => letter.toUpperCase());
    },

    /**
     * Formatea un valor para mostrar en tabla
     */
    formatTableValue(value, fallback = 'N/A') {
        if (!ValidationUtils.isNotEmpty(value)) return fallback;
        return ValidationUtils.sanitizeString(value.toString());
    }
};

/**
 * Utilidades de rendimiento
 */
const PerformanceUtils = {
    /**
     * Implementa debounce para funciones
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Implementa throttle para funciones
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Medición de tiempo de ejecución
     */
    measureTime(label) {
        const start = performance.now();
        return {
            end: () => {
                const end = performance.now();
                const duration = end - start;
                console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
                return duration;
            }
        };
    },

    /**
     * Procesa datos en chunks para evitar bloquear el hilo principal
     */
    async processInChunks(data, processor, chunkSize = 100) {
        const results = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const chunkResults = chunk.map(processor);
            results.push(...chunkResults);
            
            // Permite que el navegador procese otros eventos
            if (i + chunkSize < data.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        return results;
    }
};

/**
 * Utilidades de datos
 */
const DataUtils = {
    /**
     * Obtiene el nombre del indicador de forma robusta
     */
    getIndicatorName(indicator) {
        const nameFields = CONFIG.FIELD_MAPPING.indicatorName;
        
        for (const field of nameFields) {
            if (ValidationUtils.isNotEmpty(indicator[field])) {
                return ValidationUtils.sanitizeString(indicator[field]);
            }
        }
        
        return CONFIG.FALLBACK_VALUES.indicatorName;
    },

    /**
     * Obtiene un campo de forma robusta con fallback
     */
    getFieldValue(item, fieldMapping, fallback) {
        const fields = CONFIG.FIELD_MAPPING[fieldMapping] || [fieldMapping];
        
        for (const field of fields) {
            if (ValidationUtils.isNotEmpty(item[field])) {
                return ValidationUtils.sanitizeString(item[field]);
            }
        }
        
        return fallback || CONFIG.FALLBACK_VALUES[fieldMapping] || 'N/A';
    },

    /**
     * Filtra datos basado en criterios múltiples
     */
    filterData(data, filters) {
        return data.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value || value === '') return true;
                
                const itemValue = this.getFieldValue(item, key, '').toLowerCase();
                const filterValue = value.toLowerCase();
                
                return itemValue.includes(filterValue);
            });
        });
    },

    /**
     * Agrupa datos por un campo específico
     */
    groupBy(data, field) {
        const groups = {};
        
        data.forEach(item => {
            const key = this.getFieldValue(item, field, 'Sin categoría');
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });
        
        return groups;
    },

    /**
     * Cuenta ocurrencias de valores únicos
     */
    countUniqueValues(data, field) {
        const counts = {};
        
        data.forEach(item => {
            const value = this.getFieldValue(item, field, 'Sin definir');
            counts[value] = (counts[value] || 0) + 1;
        });
        
        return counts;
    }
};

/**
 * Utilidades de errores
 */
const ErrorUtils = {
    /**
     * Maneja errores de forma centralizada
     */
    handleError(error, context = 'Aplicación', showNotification = true) {
        const errorMessage = this.getErrorMessage(error);
        const fullMessage = `${context}: ${errorMessage}`;
        
        console.error(`❌ ${fullMessage}`, error);
        
        if (showNotification && window.NotificationManager) {
            NotificationManager.show(errorMessage, 'error');
        }
        
        return {
            message: errorMessage,
            context,
            timestamp: new Date(),
            stack: error.stack
        };
    },

    /**
     * Obtiene un mensaje de error legible
     */
    getErrorMessage(error) {
        if (typeof error === 'string') return error;
        
        if (error instanceof Error) {
            // Errores de red
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return CONFIG.ERROR_MESSAGES.networkError;
            }
            
            // Errores de parsing
            if (error.message.includes('CSV') || error.message.includes('parse')) {
                return CONFIG.ERROR_MESSAGES.csvInvalid;
            }
            
            return error.message;
        }
        
        return CONFIG.ERROR_MESSAGES.unknownError;
    },

    /**
     * Wrapper para funciones async con manejo de errores
     */
    async safeAsync(asyncFn, context, fallbackValue = null) {
        try {
            return await asyncFn();
        } catch (error) {
            this.handleError(error, context);
            return fallbackValue;
        }
    }
};

/**
 * Utilidades de accesibilidad
 */
const AccessibilityUtils = {
    /**
     * Configura navegación por teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    },

    /**
     * Anuncia cambios a lectores de pantalla
     */
    announceToScreenReader(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', true);
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        document.body.appendChild(announcement);
        announcement.textContent = message;
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
};

// Exportar utilidades globalmente
window.DOMUtils = DOMUtils;
window.ValidationUtils = ValidationUtils;
window.FormatUtils = FormatUtils;
window.PerformanceUtils = PerformanceUtils;
window.DataUtils = DataUtils;
window.ErrorUtils = ErrorUtils;
window.AccessibilityUtils = AccessibilityUtils;

// Configurar accesibilidad al cargar
document.addEventListener('DOMContentLoaded', () => {
    AccessibilityUtils.setupKeyboardNavigation();
});
