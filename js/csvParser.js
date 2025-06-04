// js/csvParser.js
class CSVParser {
    static parse(csv) {
        console.log("🔄 Iniciando parseo de CSV...");
        
        try {
            if (!csv || typeof csv !== 'string') {
                throw new Error('El contenido CSV está vacío o no es válido');
            }

            // Limpiar BOM y dividir líneas
            const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/)
                .filter(line => line.trim() !== '');

            if (lines.length < 2) {
                throw new Error('El CSV debe tener al menos una fila de encabezados y una de datos');
            }

            // Procesar encabezados
            const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
            console.log("📋 Encabezados encontrados:", headers);

            // Validar columnas requeridas
            const missingColumns = CONFIG.REQUIRED_COLUMNS.filter(col => !headers.includes(col));
            if (missingColumns.length > 0) {
                console.warn(`⚠️ Columnas faltantes: ${missingColumns.join(', ')}`);
                NotificationManager.show(
                    `Algunas columnas esperadas no están presentes: ${missingColumns.join(', ')}`,
                    'warning'
                );
            }

            // Procesar datos
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = lines[i].split(';').map(v => v.trim().replace(/"/g, ''));
                    const obj = {};
                    
                    headers.forEach((header, index) => {
                        obj[header] = values[index] || '';
                    });

                    // Validar que tenga al menos un identificador
                    if (this.getIndicatorName(obj) !== CONFIG.FALLBACK_VALUES.indicatorName) {
                        data.push(obj);
                    }
                } catch (error) {
                    console.error(`❌ Error procesando fila ${i + 1}:`, error);
                }
            }

            console.log(`✅ CSV parseado exitosamente. ${data.length} registros válidos`);
            return data;

        } catch (error) {
            console.error('💥 Error crítico en parseCSV:', error);
            NotificationManager.show(
                `Error al procesar el archivo CSV: ${error.message}`,
                'error'
            );
            return [];
        }
    }

    static getIndicatorName(indicator) {
        return indicator.Nombre_Indicador || 
               indicator['Descripción IN'] || 
               indicator.N || 
               CONFIG.FALLBACK_VALUES.indicatorName;
    }
}

// Hacer disponible globalmente
window.CSVParser = CSVParser;
