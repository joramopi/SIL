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

## License

This project is licensed under the [MIT License](LICENSE).
