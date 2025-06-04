// js/chartManager.js

/**
 * Clase para gestionar todos los gráficos del dashboard
 */
class ChartManager {
    constructor() {
        this.charts = {
            component: null,
            periodicity: null
        };
        
        this.isInitialized = false;
    }

    /**
     * Inicializa todos los gráficos
     */
    initialize() {
        console.log("📈 Inicializando gráficos...");
        
        try {
            this.initializeComponentChart();
            this.initializePeriodicityChart();
            
            this.isInitialized = true;
            console.log("✅ Gráficos inicializados exitosamente");
            
        } catch (error) {
            ErrorUtils.handleError(error, 'Inicialización de Gráficos');
        }
    }

    /**
     * Actualiza todos los gráficos con nuevos datos
     */
    updateCharts(data) {
        if (!this.isInitialized) {
            console.warn('⚠️ Gráficos no inicializados, inicializando ahora...');
            this.initialize();
        }

        try {
            this.updateComponentChart(data);
            this.updatePeriodicityChart(data);
            
        } catch (error) {
            ErrorUtils.handleError(error, 'Actualización de Gráficos');
        }
    }

    /**
     * Inicializa el gráfico de componentes
     */
    initializeComponentChart() {
        const canvas = DOMUtils.safeQuerySelector('#componentChart');
        if (!canvas) {
            console.warn('⚠️ Canvas del gráfico de componentes no encontrado');
            return;
        }

        // Destruir gráfico anterior si existe
        if (this.charts.component) {
            this.charts.component.destroy();
        }

        try {
            const ctx = canvas.getContext('2d');
            
            this.charts.component = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [],
                        borderWidth: 0,
                        hoverBorderWidth: 2,
                        hoverBorderColor: '#ffffff'
                    }]
                },
                options: {
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
                                // Removida la función generateLabels personalizada
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed} indicadores (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: CONFIG.CHART_ANIMATION_DURATION
                    }
                }
            });

            console.log("✅ Gráfico de componentes inicializado");

        } catch (error) {
            this.showChartError('componentChart', 'Error al inicializar gráfico de componentes');
            throw error;
        }
    }

    /**
     * Inicializa el gráfico de periodicidad
     */
    initializePeriodicityChart() {
        const canvas = DOMUtils.safeQuerySelector('#periodicityChart');
        if (!canvas) {
            console.warn('⚠️ Canvas del gráfico de periodicidad no encontrado');
            return;
        }

        // Destruir gráfico anterior si existe
        if (this.charts.periodicity) {
            this.charts.periodicity.destroy();
        }

        try {
            const ctx = canvas.getContext('2d');
            
            this.charts.periodicity = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: CONFIG.PERIODICITIES,
                    datasets: [{
                        label: 'Número de Indicadores',
                        data: [],
                        backgroundColor: 'rgba(30, 76, 114, 0.8)',
                        borderColor: '#1e4c72',
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: false 
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    return `${context.parsed.y} indicadores con periodicidad ${context.label.toLowerCase()}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { 
                                stepSize: 1,
                                callback: function(value) {
                                    return Number.isInteger(value) ? value : '';
                                }
                            },
                            title: {
                                display: true,
                                text: 'Número de Indicadores'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Periodicidad'
                            }
                        }
                    },
                    animation: {
                        duration: CONFIG.CHART_ANIMATION_DURATION
                    }
                }
            });

            console.log("✅ Gráfico de periodicidad inicializado");

        } catch (error) {
            this.showChartError('periodicityChart', 'Error al inicializar gráfico de periodicidad');
            throw error;
        }
    }

    /**
     * Actualiza el gráfico de componentes
     */
    updateComponentChart(data) {
        if (!this.charts.component) {
            console.warn('⚠️ Gráfico de componentes no inicializado');
            return;
        }

        try {
            this.showChartLoading('componentChart', true);

            // Contar componentes directamente del CSV
            const componentCounts = {};
            data.forEach(item => {
                const component = item.Componente; // Acceso directo a la columna
                if (component && component.trim() !== '') {
                    const cleanComponent = component.trim();
                    componentCounts[cleanComponent] = (componentCounts[cleanComponent] || 0) + 1;
                }
            });
            
            console.log('🔍 Debug - Datos de componentes (directo):', componentCounts);
            
            // Filtrar valores si hay demasiados
            const filteredCounts = this.filterChartData(componentCounts);
            
            const labels = Object.keys(filteredCounts);
            const values = Object.values(filteredCounts);
            const colors = CONFIG.getChartColors(labels.length);

            console.log('📊 Debug - Labels del gráfico:', labels);
            console.log('📊 Debug - Valores del gráfico:', values);

            if (labels.length === 0) {
                this.showEmptyChart('componentChart', 'No hay datos de componentes para mostrar');
                return;
            }

            // Actualizar datos del gráfico
            this.charts.component.data.labels = labels;
            this.charts.component.data.datasets[0].data = values;
            this.charts.component.data.datasets[0].backgroundColor = colors;

            // Actualizar el gráfico
            this.charts.component.update('active');

            this.hideChartError('componentChart');
            this.showChartLoading('componentChart', false);

            console.log(`✅ Gráfico de componentes actualizado con ${labels.length} categorías`);

        } catch (error) {
            this.showChartError('componentChart', 'Error al actualizar gráfico de componentes');
            this.showChartLoading('componentChart', false);
            console.error('❌ Error detallado en gráfico de componentes:', error);
            throw error;
        }
    }

    /**
     * Actualiza el gráfico de periodicidad
     */
    updatePeriodicityChart(data) {
        if (!this.charts.periodicity) {
            console.warn('⚠️ Gráfico de periodicidad no inicializado');
            return;
        }

        try {
            this.showChartLoading('periodicityChart', true);

            // Generar datos de ejemplo basados en el total de indicadores
            // En una implementación real, estos datos vendrían del CSV
            const total = data.length;
            const periodicityData = this.generatePeriodicityData(total);

            // Actualizar datos del gráfico
            this.charts.periodicity.data.datasets[0].data = periodicityData;

            // Actualizar el gráfico
            this.charts.periodicity.update('active');

            this.hideChartError('periodicityChart');
            this.showChartLoading('periodicityChart', false);

            console.log(`✅ Gráfico de periodicidad actualizado`);

        } catch (error) {
            this.showChartError('periodicityChart', 'Error al actualizar gráfico de periodicidad');
            this.showChartLoading('periodicityChart', false);
            throw error;
        }
    }

    /**
     * Filtra datos del gráfico para mejorar visualización
     */
    filterChartData(counts, maxItems = CONFIG.MAX_CHART_ITEMS) {
        const entries = Object.entries(counts);
        
        // Si hay pocos elementos, devolver todos
        if (entries.length <= maxItems) {
            return counts;
        }

        // Ordenar por valor descendente
        entries.sort((a, b) => b[1] - a[1]);

        // Tomar los primeros maxItems-1 elementos
        const topEntries = entries.slice(0, maxItems - 1);
        const otherEntries = entries.slice(maxItems - 1);

        // Agrupar el resto en "Otros"
        const otherTotal = otherEntries.reduce((sum, [, value]) => sum + value, 0);

        const result = {};
        topEntries.forEach(([key, value]) => {
            result[key] = value;
        });

        if (otherTotal > 0) {
            result['Otros'] = otherTotal;
        }

        return result;
    }

    /**
     * Genera datos de periodicidad de ejemplo
     */
    generatePeriodicityData(total) {
        if (total === 0) return [0, 0, 0, 0];

        // Distribución aproximada basada en datos típicos
        const distributions = [0.15, 0.25, 0.20, 0.40]; // Mensual, Trimestral, Semestral, Anual
        
        return distributions.map(ratio => Math.round(total * ratio));
    }

    /**
     * Muestra estado de carga en un gráfico
     */
    showChartLoading(chartId, show) {
        const loadingElement = DOMUtils.safeQuerySelector(`#${chartId}Loading`);
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Muestra error en un gráfico
     */
    showChartError(chartId, message) {
        const errorElement = DOMUtils.safeQuerySelector(`#${chartId}Error`);
        if (errorElement) {
            errorElement.style.display = 'block';
            const messageElement = errorElement.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }

        console.error(`❌ Error en gráfico ${chartId}: ${message}`);
    }

    /**
     * Oculta error en un gráfico
     */
    hideChartError(chartId) {
        const errorElement = DOMUtils.safeQuerySelector(`#${chartId}Error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * Muestra estado vacío en un gráfico
     */
    showEmptyChart(chartId, message) {
        const errorElement = DOMUtils.safeQuerySelector(`#${chartId}Error`);
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.innerHTML = `
                <i class="fas fa-chart-pie" style="color: var(--medium-gray);"></i>
                <p>${message}</p>
            `;
        }
    }

    /**
     * Redimensiona todos los gráficos
     */
    resize() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }

    /**
     * Destruye todos los gráficos
     */
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        
        this.charts = {
            component: null,
            periodicity: null
        };
        
        this.isInitialized = false;
        console.log("🗑️ Gráficos destruidos");
    }

    /**
     * Exporta un gráfico como imagen
     */
    exportChart(chartType, filename) {
        const chart = this.charts[chartType];
        if (!chart) {
            console.warn(`⚠️ Gráfico ${chartType} no encontrado`);
            return null;
        }

        try {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `${filename || chartType}_${Date.now()}.png`;
            link.href = url;
            link.click();

            NotificationManager.show(`Gráfico ${chartType} exportado exitosamente`, 'success');
            return url;

        } catch (error) {
            ErrorUtils.handleError(error, `Exportación de gráfico ${chartType}`);
            return null;
        }
    }

    /**
     * Obtiene estadísticas de un gráfico
     */
    getChartStats(chartType) {
        const chart = this.charts[chartType];
        if (!chart) return null;

        const data = chart.data.datasets[0].data;
        const labels = chart.data.labels;

        return {
            type: chartType,
            totalItems: labels.length,
            totalValue: data.reduce((a, b) => a + b, 0),
            maxValue: Math.max(...data),
            minValue: Math.min(...data),
            averageValue: data.reduce((a, b) => a + b, 0) / data.length
        };
    }
}

// Configurar redimensionamiento automático
window.addEventListener('resize', PerformanceUtils.debounce(() => {
    if (window.dashboard?.chartManager) {
        window.dashboard.chartManager.resize();
    }
}, 250));

// Hacer disponible globalmente
window.ChartManager = ChartManager;