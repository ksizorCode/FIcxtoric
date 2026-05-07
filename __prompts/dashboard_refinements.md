# User Request: Default View and Dashboard Enhancements

## Request
1. la web comienza mostrando el listado de ediciones: en la Vista Ediciones del Festival
2. En el Dashboard de cineastas los datos se actualizan cuando se cambia de filtro (Todos, Directores, Autores, Guionistas...)
3. En al Dashboard de Secciones muestra una gráfica de cantidad de películas por sección, y por festival-sección

## Implementation Strategy
- **Default View**: Modified `init()` in `app.js` to set `currentView = 'ediciones'` and update navigation states accordingly.
- **Cineastas Dashboard**: Updated `filterCineastas` to detect if the current mode is `dashboard` and re-render the section dashboard with filtered data.
- **Secciones Dashboard**: 
    - Calculated movie counts per section from the dataset.
    - Implemented a "Total Movies per Section" bar chart.
    - Implemented a "Festival-Section Evolution" stacked bar chart using the last 5 editions to show how sections vary over time.
