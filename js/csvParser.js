// js/csvParser.js
class CSVParser {
    static parse(csv) {
        console.log("🔄 Iniciando parseo de CSV...");
        
        try {
            if (!csv || typeof csv !== 'string') {
                throw new Error('El contenido CSV está vacío o no es válido');
            }

            // Limpiar BOM y corregir codificación de caracteres
            let cleanedCSV = csv.replace(/^\uFEFF/, ''); // Remover BOM UTF-8
            
            // Corregir caracteres mal codificados comunes
            cleanedCSV = this.fixEncoding(cleanedCSV);
            
            const lines = cleanedCSV.split(/\r?\n/)
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
                    const values = lines[i].split(';').map(v => {
                        // Limpiar y corregir codificación de cada valor
                        let cleanValue = v.trim().replace(/"/g, '');
                        cleanValue = this.fixEncoding(cleanValue);
                        return cleanValue;
                    });
                    
                    const obj = {};
                    
                    headers.forEach((header, index) => {
                        obj[header] = values[index] || '';
                    });

                    // Debug: mostrar el primer registro procesado
                    if (i === 1) {
                        console.log("🔍 Debug - Primer registro procesado:", obj);
                    }

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

    /**
     * Corrige problemas de codificación de caracteres
     */
    static fixEncoding(text) {
        if (typeof text !== 'string') return text;
        
        // Mapa de caracteres mal codificados a caracteres correctos
        const encodingMap = {
            // Vocales con tilde
            'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
            'Ã': 'Á', 'Ã‰': 'É', 'Ã': 'Í', 'Ã"': 'Ó', 'Ãš': 'Ú',
            
            // Eñe
            'Ã±': 'ñ', 'Ã'': 'Ñ',
            
            // Diéresis
            'Ã¼': 'ü', 'Ãœ': 'Ü',
            
            // Otros caracteres especiales comunes
            'Â¿': '¿', 'Â¡': '¡',
            'Â°': '°', 'Âª': 'ª', 'Âº': 'º',
            
            // Patrones específicos encontrados
            'N mero': 'Número',
            'n mero': 'número',
            'tecnol gico': 'tecnológico',
            'Tecnol gico': 'Tecnológico',
            'beneficiados': 'beneficiados', // Ya está bien, pero por si acaso
            
            // Más patrones comunes
            'Educaci n': 'Educación',
            'educaci n': 'educación',
            'Poblaci n': 'Población',
            'poblaci n': 'población',
            'Informaci n': 'Información',
            'informaci n': 'información',
            'Direcci n': 'Dirección',
            'direcci n': 'dirección',
            'Atenci n': 'Atención',
            'atenci n': 'atención',
            'Prevenci n': 'Prevención',
            'prevenci n': 'prevención'
        };

        let fixedText = text;

        // Aplicar reemplazos directos
        Object.keys(encodingMap).forEach(badChar => {
            if (typeof encodingMap[badChar] === 'string') {
                fixedText = fixedText.split(badChar).join(encodingMap[badChar]);
            }
        });

        // Patrón especial para   seguido de caracteres
        fixedText = fixedText.replace(/ ([a-zA-Z])/g, (match, letter) => {
            const commonReplacements = {
                'n': 'ñ', 'N': 'Ñ',
                'a': 'á', 'A': 'Á',
                'e': 'é', 'E': 'É',
                'i': 'í', 'I': 'Í',
                'o': 'ó', 'O': 'Ó',
                'u': 'ú', 'U': 'Ú'
            };
            return commonReplacements[letter] || letter;
        });

        // Limpiar otros caracteres problemáticos
        fixedText = fixedText
            .replace(/â€™/g, "'")  // Apóstrofe
            .replace(/â€œ/g, '"')  // Comilla izquierda
            .replace(/â€/g, '"')   // Comilla derecha
            .replace(/â€"/g, '–')  // Guión en dash
            .replace(/â€"/g, '—')  // Guión em dash
            .replace(/Â/g, '')     // Caracteres Â sueltos
            .replace(/ /g, '');    // Caracteres   que no se pudieron corregir

        return fixedText;
    }

    static getIndicatorName(indicator) {
        let name = indicator.Nombre_Indicador || 
                   indicator.Indicador || 
                   indicator.N || 
                   CONFIG.FALLBACK_VALUES.indicatorName;
        
        // Aplicar corrección de codificación al nombre
        return this.fixEncoding(name);
    }
}

// Hacer disponible globalmente
window.CSVParser = CSVParser;