// js/csvParser.js
class CSVParser {
    static parse(csv, progressCallback) {
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
                    if (typeof progressCallback === 'function') {
                        progressCallback(i, lines.length - 1);
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
            // Vocales con tilde - usando códigos de escape
            '\u00C3\u00A1': 'á', // Ã¡ -> á
            '\u00C3\u00A9': 'é', // Ã© -> é
            '\u00C3\u00AD': 'í', // Ã­ -> í
            '\u00C3\u00B3': 'ó', // Ã³ -> ó
            '\u00C3\u00BA': 'ú', // Ãº -> ú
            '\u00C3\u0081': 'Á', // Ã -> Á
            '\u00C3\u0089': 'É', // Ã‰ -> É
            '\u00C3\u008D': 'Í', // Ã -> Í
            '\u00C3\u0093': 'Ó', // Ã" -> Ó
            '\u00C3\u009A': 'Ú', // Ãš -> Ú
            
            // Eñe
            '\u00C3\u00B1': 'ñ', // Ã± -> ñ
            '\u00C3\u0091': 'Ñ', // Ã' -> Ñ
            
            // Diéresis
            '\u00C3\u00BC': 'ü', // Ã¼ -> ü
            '\u00C3\u009C': 'Ü', // Ãœ -> Ü
            
            // Otros caracteres especiales comunes
            '\u00C2\u00BF': '¿', // Â¿ -> ¿
            '\u00C2\u00A1': '¡', // Â¡ -> ¡
            '\u00C2\u00B0': '°', // Â° -> °
            '\u00C2\u00AA': 'ª', // Âª -> ª
            '\u00C2\u00BA': 'º', // Âº -> º
            
            // Patrones específicos encontrados
            'N\uFFFDmero': 'Número',
            'n\uFFFDmero': 'número',
            'tecnol\uFFFDgico': 'tecnológico',
            'Tecnol\uFFFDgico': 'Tecnológico',
            
            // Más patrones comunes
            'Educaci\uFFFDn': 'Educación',
            'educaci\uFFFDn': 'educación',
            'Poblaci\uFFFDn': 'Población',
            'poblaci\uFFFDn': 'población',
            'Informaci\uFFFDn': 'Información',
            'informaci\uFFFDn': 'información',
            'Direcci\uFFFDn': 'Dirección',
            'direcci\uFFFDn': 'dirección',
            'Atenci\uFFFDn': 'Atención',
            'atenci\uFFFDn': 'atención',
            'Prevenci\uFFFDn': 'Prevención',
            'prevenci\uFFFDn': 'prevención'
        };

        let fixedText = text;

        // Aplicar reemplazos directos
        Object.keys(encodingMap).forEach(badChar => {
            const fixedChar = encodingMap[badChar];
            fixedText = fixedText.split(badChar).join(fixedChar);
        });

        // Patrón especial para caracteres de reemplazo seguidos de letras
        fixedText = fixedText.replace(/\uFFFD([a-zA-Z])/g, function(match, letter) {
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

        // Limpiar otros caracteres problemáticos usando códigos de escape
        fixedText = fixedText
            .replace(/\u2019/g, "'")     // Apóstrofe curvado
            .replace(/\u201C/g, '"')     // Comilla izquierda
            .replace(/\u201D/g, '"')     // Comilla derecha
            .replace(/\u2013/g, '–')     // Guión en dash
            .replace(/\u2014/g, '—')     // Guión em dash
            .replace(/\u00C2/g, '')      // Caracteres Â sueltos
            .replace(/\uFFFD/g, '');     // Caracteres de reemplazo que no se pudieron corregir

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