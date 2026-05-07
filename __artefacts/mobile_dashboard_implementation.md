# Mobile UI & Interactive Dashboards Implementation

## Overview
The application has been upgraded to provide a native mobile app experience and a powerful new data visualization mode for all sections.

## Key Changes

### 1. Mobile App Interface
- **Bottom Navigation**: The sidebar now transforms into a premium bottom navigation bar on mobile devices (under 768px). It features a glassmorphism effect, subtle shadows, and centered icons with labels.
- **Discrete Top Logo**: A new simplified logo appears at the top of the screen on mobile, providing brand presence without consuming excessive space.
- **Optimized Layout**: The main content area now properly accounts for the bottom navigation and top bar heights to prevent overlap.

### 2. Interactive Section Dashboards
A new **Dashboard Mode** has been added to the view controls (Grid, List, Table, etc.). When activated within any section (Ediciones, Movies, Filmmakers, etc.), it displays:

- **Data Bubbles**: Key performance indicators (KPIs) relevant to the section (e.g., Total Movies, Average Duration, Number of Countries).
- **Interactive Charts**:
    - **Movies**: Distribution by country (Bar Chart) and Section (Pie Chart).
    - **Ediciones**: Historical trend of attendees (Line Chart).
    - **Cineastas**: Roles distribution (Doughnut Chart) and top countries of origin (Horizontal Bar Chart).
- **Responsive Grid**: The dashboard layout automatically adapts to different screen sizes, ensuring clear data presentation on both mobile and desktop.

## Technical Details
- **Styling**: Vanilla CSS with advanced media queries and flexbox/grid layouts.
- **Logic**: Enhanced `app.js` with `renderSectionDashboard` and `initSectionCharts` functions.
- **Library**: Utilizes **Chart.js** for all data visualizations.

## How to access
1. Navigate to any section (e.g., "Películas").
2. In the top right (or top on mobile), click the new **Chart/Pie Icon** after the Map icon.
3. Explore the interactive data for that specific section!
