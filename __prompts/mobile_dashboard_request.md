# User Request: Mobile App UI and Section Dashboards

## Request
1. En la verisón movil quiero que el menu principal aparezca como un menú movil tipo app
2. En logo en la parte de arriba del todo más discreto
3. Y en el menú de vistas, tras el botón de mapa, quiero otro botón para dashboard que me muestre los datos de ese apartado en formatos de dashboards interactivos, con gráficos, mapas, graficos de tarta y elementos interactivos con los datos de ese apartado con los que poder jugar

## Implementation Strategy
- **Mobile UI**: Update CSS media queries to transform the sidebar into a high-end bottom navigation bar. Add a new sticky top bar for mobile with a simplified, discrete logo.
- **Dashboard Mode**:
    - Add a new button in the view controls for 'Dashboard' mode.
    - Implement `renderSectionDashboard` in `app.js` to handle data visualization for each section (Movies, Editions, Filmmakers).
    - Use Chart.js (already included in the project) to create dynamic charts.
    - Add 'Data Bubbles' for quick stat overview.
