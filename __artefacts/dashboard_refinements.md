# Dashboard Refinements & Default View

## Overview
Improved the initial loading experience and added advanced data visualization to the Section dashboards.

## Key Changes

### 1. Default Entry Point
- The application now defaults to the **Ediciones** view upon loading, highlighting the historical editions of the festival immediately.

### 2. Enhanced Cineastas Dashboard
- **Real-time Filtering**: Applying filters (Directores, Actores, etc.) now dynamically updates the dashboard's statistics and charts, allowing for granular analysis of filmmaker roles.

### 3. Advanced Secciones Dashboard
- **Historical Analysis**: New charts visualize the distribution of movies across different sections.
- **Festival-Section Evolution**: A stacked bar chart tracks how sections have evolved over the last 5 editions, showing the number of films in each category per year.

## Technical Implementation
- **Filtered Rendering**: Integrated `renderSectionDashboard` into the filtering logic for seamless transitions between data views.
- **Data Aggregation**: Implemented custom logic to group and count movies across the entire historical dataset for longitudinal analysis.
- **Visualization**: Leveraged Chart.js stacked bar configurations for multi-dimensional data display.
