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
            console.log(`📈 Actualizando gráficos con ${data.length} registros`);
            
            this.updateComponentChart(data);
            this.updatePeriodicityChart(data);
            
            console.log('✅ Gráficos actualizados exitosamente');
            
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
                                font: { size: 12 },
                                // Función personalizada para mostrar valores y porcentajes en la leyenda
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        const dataset = data.datasets[0];
                                        const total = dataset.data.reduce(function(sum, value) {
                                            return sum + value;
                                        }, 0);
                                        
                                        return data.labels.map(function(label, index) {
                                            const value = dataset.data[index];
                                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                            
                                            return {
                                                text: label + ' (' + value + ' - ' + percentage + '%)',
                                                fillStyle: dataset.backgroundColor[index],
                                                strokeStyle: dataset.backgroundColor[index],
                                                lineWidth: 0,
                                                pointStyle: 'circle',
                                                hidden: false,
                                                index: index
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return context.label + ': ' + context.parsed + ' indicadores (' + percentage + '%)';
                                }
                            }
                        },
                        // Plugin para mostrar valores y porcentajes en el centro del gráfico
                        beforeDraw: function(chart) {
                            if (chart.config.type === 'doughnut') {
                                const ctx = chart.ctx;
                                const width = chart.width;
                                const height = chart.height;
                                
                                ctx.restore();
                                const fontSize = (height / 114).toFixed(2);
                                ctx.font = fontSize + "em sans-serif";
                                ctx.textBaseline = "middle";
                                ctx.fillStyle = "#495057";
                                
                                const total = chart.data.datasets[0].data.reduce(function(sum, value) {
                                    return sum + value;
                                }, 0);
                                
                                const text = "Total";
                                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                                const textY = height / 2 - 10;
                                
                                const valueText = total.toString();
                                const valueX = Math.round((width - ctx.measureText(valueText).width) / 2);
                                const valueY = height / 2 + 15;
                                
                                ctx.fillText(text, textX, textY);
                                ctx.font = (fontSize * 1.5) + "em sans-serif";
                                ctx.fillStyle = "#1e4c72";
                                ctx.fillText(valueText, valueX, valueY);
                                ctx.save();
                            }
                        }
                    },
                    animation: {
                        duration: CONFIG.CHART_ANIMATION_DURATION
                    }
                }
            });

            console.log("✅ Gráfico de componentes inicializado con valores y porcentajes visibles");

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
                        backgroundColor: CONFIG.PERIODICITY_COLORS, // Usar colores específicos
                        borderColor: CONFIG.PERIODICITY_COLORS.map(function(color) {
                            // Hacer el borde un poco más oscuro
                            return color;
                        }),
                        borderWidth: 2,
                        borderRadius: 6,
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
                                label: function(context) {
                                    const total = context.dataset.data.reduce(function(sum, value) {
                                        return sum + value;
                                    }, 0);
                                    const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
                                    return context.parsed.y + ' indicadores (' + percentage + '%) - ' + context.label;
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
                        duration: CONFIG.CHART_ANIMATION_DURATION,
                        onComplete: function(context) {
                            // Dibujar etiquetas con valores y porcentajes encima de las barras
                            const chart = context.chart;
                            const ctx = chart.ctx;
                            
                            ctx.font = 'bold 12px sans-serif';
                            ctx.fillStyle = '#495057';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            
                            const dataset = chart.data.datasets[0];
                            const total = dataset.data.reduce(function(sum, value) {
                                return sum + value;
                            }, 0);
                            
                            dataset.data.forEach(function(value, index) {
                                if (value > 0) {
                                    const meta = chart.getDatasetMeta(0);
                                    const bar = meta.data[index];
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    
                                    // Dibujar valor
                                    ctx.fillText(value.toString(), bar.x, bar.y - 25);
                                    
                                    // Dibujar porcentaje
                                    ctx.font = '10px sans-serif';
                                    ctx.fillStyle = '#666';
                                    ctx.fillText('(' + percentage + '%)', bar.x, bar.y - 10);
                                    
                                    // Restaurar fuente para la siguiente iteración
                                    ctx.font = 'bold 12px sans-serif';
                                    ctx.fillStyle = '#495057';
                                }
                            });
                        }
                    }
                }
            });

            console.log("✅ Gráfico de periodicidad inicializado con valores y porcentajes visibles");

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

            // Contar componentes directamente del CSV con corrección de codificación
            const componentCounts = {};
            data.forEach(function(item) {
                let component = item.Componente; // Acceso directo a la columna
                if (component && component.trim() !== '') {
                    // Aplicar corrección básica de codificación
                    component = ChartManager.fixBasicEncoding(component.trim());
                    componentCounts[component] = (componentCounts[component] || 0) + 1;
                }
            });
            
            console.log('🔍 Debug - Datos de componentes (con codificación corregida):', componentCounts);
            
            // Filtrar valores si hay demasiados
            const filteredCounts = this.filterChartData(componentCounts);
            
            const labels = Object.keys(filteredCounts);
            const values = Object.values(filteredCounts);
            
            // Asignar colores únicos a cada componente de la paleta de azules y verdes
            const colors = this.getComponentColors(labels);

            console.log('📊 Debug - Labels del gráfico (corregidos):', labels);
            console.log('📊 Debug - Valores del gráfico:', values);
            console.log('🎨 Debug - Colores asignados:', colors);

            if (labels.length === 0) {
                this.showEmptyChart('componentChart', 'No hay datos de componentes para mostrar');
                return;
            }

            // Actualizar datos del gráfico
            this.charts.component.data.labels = labels;
            this.charts.component.data.datasets[0].data = values;
            this.charts.component.data.datasets[0].backgroundColor = colors;

            // Forzar actualización de las etiquetas de la leyenda con valores y porcentajes
            this.charts.component.options.plugins.legend.labels.generateLabels = function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                    const dataset = data.datasets[0];
                    const total = dataset.data.reduce(function(sum, value) {
                        return sum + value;
                    }, 0);
                    
                    return data.labels.map(function(label, index) {
                        const value = dataset.data[index];
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        
                        return {
                            text: label + ' (' + value + ' - ' + percentage + '%)',
                            fillStyle: dataset.backgroundColor[index],
                            strokeStyle: dataset.backgroundColor[index],
                            lineWidth: 0,
                            pointStyle: 'circle',
                            hidden: false,
                            index: index
                        };
                    });
                }
                return [];
            };

            // Actualizar el gráfico
            this.charts.component.update('active');

            this.hideChartError('componentChart');
            this.showChartLoading('componentChart', false);

            console.log(`✅ Gráfico de componentes actualizado con ${labels.length} categorías, colores únicos y porcentajes visibles`);

        } catch (error) {
            this.showChartError('componentChart', 'Error al actualizar gráfico de componentes');
            this.showChartLoading('componentChart', false);
            console.error('❌ Error detallado en gráfico de componentes:', error);
            throw error;
        }
    }

    /**
     * Obtiene colores únicos para cada componente
     */
    getComponentColors(labels) {
        const colors = [];
        const availableColors = CONFIG.CHART_COLORS;
        
        for (let i = 0; i < labels.length; i++) {
            // Usar el color correspondiente del array, y si se acaban, repetir
            colors.push(availableColors[i % availableColors.length]);
        }
        
        return colors;
    }

    /**
     * Corrección básica de codificación sin dependencias externas
     */
    static fixBasicEncoding(text) {
        if (typeof text !== 'string') return text;
        
        return text
            .replace(/\uFFFD/g, '')  // Remover caracteres de reemplazo
            .replace(/N\uFFFDmero/g, 'Número')
            .replace(/n\uFFFDmero/g, 'número')
            .replace(/tecnol\uFFFDgico/g, 'tecnológico')
            .replace(/Educaci\uFFFDn/g, 'Educación')
            .replace(/educaci\uFFFDn/g, 'educación')
            .replace(/Poblaci\uFFFDn/g, 'Población')
            .replace(/poblaci\uFFFDn/g, 'población')
            .replace(/Informaci\uFFFDn/g, 'Información')
            .replace(/informaci\uFFFDn/g, 'información')
            .replace(/Direcci\uFFFDn/g, 'Dirección')
            .replace(/direcci\uFFFDn/g, 'dirección')
            .replace(/Atenci\uFFFDn/g, 'Atención')
            .replace(/atenci\uFFFDn/g, 'atención')
            .replace(/Prevenci\uFFFDn/g, 'Prevención')
            .replace(/prevenci\uFFFDn/g, 'prevención');
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

            // Actualizar datos del gráfico con colores específicos
            this.charts.periodicity.data.datasets[0].data = periodicityData;
            this.charts.periodicity.data.datasets[0].backgroundColor = CONFIG.PERIODICITY_COLORS;
            this.charts.periodicity.data.datasets[0].borderColor = CONFIG.PERIODICITY_COLORS;

            // Actualizar la función de animación para mostrar valores y porcentajes
            this.charts.periodicity.options.animation.onComplete = function(context) {
                const chart = context.chart;
                const ctx = chart.ctx;
                
                ctx.font = 'bold 12px sans-serif';
                ctx.fillStyle = '#495057';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                
                const dataset = chart.data.datasets[0];
                const total = dataset.data.reduce(function(sum, value) {
                    return sum + value;
                }, 0);
                
                dataset.data.forEach(function(value, index) {
                    if (value > 0) {
                        const meta = chart.getDatasetMeta(0);
                        const bar = meta.data[index];
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        
                        // Dibujar valor
                        ctx.fillText(value.toString(), bar.x, bar.y - 25);
                        
                        // Dibujar porcentaje
                        ctx.font = '10px sans-serif';
                        ctx.fillStyle = '#666';
                        ctx.fillText('(' + percentage + '%)', bar.x, bar.y - 10);
                        
                        // Restaurar fuente para la siguiente iteración
                        ctx.font = 'bold 12px sans-serif';
                        ctx.fillStyle = '#495057';
                    }
                });
            };

            // Actualizar el gráfico
            this.charts.periodicity.update('active');

            this.hideChartError('periodicityChart');
            this.showChartLoading('periodicityChart', false);

            console.log('✅ Gráfico de periodicidad actualizado con colores únicos y porcentajes visibles');

        } catch (error) {
            this.showChartError('periodicityChart', 'Error al actualizar gráfico de periodicidad');
            this.showChartLoading('periodicityChart', false);
            throw error;
        }
    }

    /**
     * Filtra datos del gráfico para mejorar visualización
     */
    filterChartData(counts, maxItems) {
        maxItems = maxItems || CONFIG.MAX_CHART_ITEMS;
        const entries = Object.entries(counts);
        
        // Si hay pocos elementos, devolver todos
        if (entries.length <= maxItems) {
            return counts;
        }

        // Ordenar por valor descendente
        entries.sort(function(a, b) { return b[1] - a[1]; });

        // Tomar los primeros maxItems-1 elementos
        const topEntries = entries.slice(0, maxItems - 1);
        const otherEntries = entries.slice(maxItems - 1);

        // Agrupar el resto en "Otros"
        const otherTotal = otherEntries.reduce(function(sum, entry) { return sum + entry[1]; }, 0);

        const result = {};
        topEntries.forEach(function(entry) {
            result[entry[0]] = entry[1];
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
        
        return distributions.map(function(ratio) { return Math.round(total * ratio); });
    }

    /**
     * Muestra estado de carga en un gráfico
     */
    showChartLoading(chartId, show) {
        const loadingElement = DOMUtils.safeQuerySelector('#' + chartId + 'Loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Muestra error en un gráfico
     */
    showChartError(chartId, message) {
        const errorElement = DOMUtils.safeQuerySelector('#' + chartId + 'Error');
        if (errorElement) {
            errorElement.style.display = 'block';
            const messageElement = errorElement.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }

        console.error('❌ Error en gráfico ' + chartId + ': ' + message);
    }

    /**
     * Oculta error en un gráfico
     */
    hideChartError(chartId) {
        const errorElement = DOMUtils.safeQuerySelector('#' + chartId + 'Error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * Muestra estado vacío en un gráfico
     */
    showEmptyChart(chartId, message) {
        const errorElement = DOMUtils.safeQuerySelector('#' + chartId + 'Error');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.innerHTML = '<i class="fas fa-chart-pie" style="color: var(--medium-gray);"></i><p>' + message + '</p>';
        }
    }

    /**
     * Redimensiona todos los gráficos
     */
    resize() {
        const self = this;
        Object.values(this.charts).forEach(function(chart) {
            if (chart) {
                chart.resize();
            }
        });
    }

    /**
     * Destruye todos los gráficos
     */
    destroy() {
        const self = this;
        Object.values(this.charts).forEach(function(chart) {
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
            console.warn('⚠️ Gráfico ' + chartType + ' no encontrado');
            return null;
        }

        try {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = (filename || chartType) + '_' + Date.now() + '.png';
            link.href = url;
            link.click();

            NotificationManager.show('Gráfico ' + chartType + ' exportado exitosamente', 'success');
            return url;

        } catch (error) {
            ErrorUtils.handleError(error, 'Exportación de gráfico ' + chartType);
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
            totalValue: data.reduce(function(a, b) { return a + b; }, 0),
            maxValue: Math.max.apply(null, data),
            minValue: Math.min.apply(null, data),
            averageValue: data.reduce(function(a, b) { return a + b; }, 0) / data.length
        };
    }
}

// Configurar redimensionamiento automático
window.addEventListener('resize', PerformanceUtils.debounce(function() {
    if (window.dashboard && window.dashboard.chartManager) {
        window.dashboard.chartManager.resize();
    }
}, 250));

// Hacer disponible globalmente
window.ChartManager = ChartManager;