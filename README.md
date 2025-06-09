# SIL Dashboard

This repository contains a lightweight demo of the **Sistema de Información Local** (SIL) dashboard for the Provincial Government of Manabí.

## Overview

The dashboard provides interactive charts and tables that summarize local indicators. It reads the dataset from a CSV file and renders visuals with Chart.js. FontAwesome icons are used across the interface.

## Setup

1. Clone or download this repository.
2. Ensure the CSV dataset in `data/indicators.csv` is available (it is included in the repository).
3. Open `index.html` with your preferred web browser. You can open the file directly or start a simple HTTP server and navigate to it.

The application has no build step because all dependencies are loaded from public CDNs:

- **Chart.js** – handles all chart rendering.
- **FontAwesome** – provides interface icons.

The CSV data used by the dashboard is located under `data/indicators.csv` and configured in `js/config.js`.

---

## Running tests

Run the CSV parser test with:

```bash
node tests/test-csv-parser.js
```

## CSV column reference

The dataset used by the dashboard (`data/indicators.csv`) provides multiple attributes for each indicator. The following table summarizes the meaning of each column:

| Column                  | Description                                                                  |
|-------------------------|------------------------------------------------------------------------------|
| `N`                     | Sequential number for the record.                                            |
| `Componente`            | Component or domain the indicator belongs to.                                |
| `Direccion`             | Direction/department responsible for the indicator.                          |
| `Id_RA`                 | Identifier of the administrative record.                                     |
| `Registro_Administrativo` | Name of the administrative record.                                         |
| `Indicador`             | Short indicator code.                                                        |
| `Nombre_Indicador`      | Full name of the indicator.                                                  |
| `SectorE`               | Sector classification used for grouping.                                     |
| `Dashboard`             | Dashboard or view where the indicator is displayed.                          |
| `Tematica`              | Thematic area of the indicator.                                              |
| `Eje_PDOT`              | Axis in the PDOT development plan.                                           |
| `5P1`                   | Primary classification within the "5P" framework (People, Planet, etc.).     |
| `5P2`                   | Secondary "5P" classification (often empty).                                 |
| `ODS1` ‑ `ODS6`        | Up to six Sustainable Development Goals linked to the indicator.             |

The CSV parser defined in `js/csvParser.js` validates that the columns `Componente`, `Direccion`, and `SectorE` are present. Fields such as `Nombre_Indicador`, `N`, `Id_RA`, `Registro_Administrativo`, and `Indicador` are optional but supported when available.

## License

This project is licensed under the [MIT License](LICENSE).

