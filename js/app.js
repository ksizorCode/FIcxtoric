/**
 * FICX Histórico - Core Application Logic
 */

let festivalData = null;
let currentView = 'dashboard';
let currentMode = 'grid';
let mapInstance = null;
let sortConfig = { key: null, direction: 'asc' };

// Selectors
const contentDisplay = document.getElementById('content-display');
const navLinks = document.querySelectorAll('.nav-links li');
const searchInput = document.getElementById('global-search');
const viewBtns = document.querySelectorAll('.view-btn');
const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

// Initialize App
async function init() {
    try {
        const response = await fetch('data/data.json');
        festivalData = await response.json();

        setupEventListeners();

        // La web comienza mostrando el listado de ediciones
        currentView = 'ediciones';
        navLinks.forEach(l => {
            l.classList.remove('active');
            if (l.dataset.view === 'ediciones') l.classList.add('active');
        });
        renderView('ediciones');
    } catch (error) {
        console.error('Error loading data:', error);
        contentDisplay.innerHTML = '<p>Error al cargar los datos del festival. Asegúrate de que data/data.json existe.</p>';
    }
}

function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentView = link.dataset.view;
            renderView(currentView);
        });
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // View Modes
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            renderView(currentView);
        });
    });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeToggle.innerHTML = isLight
            ? '<i class="fas fa-moon"></i> Modo Oscuro'
            : '<i class="fas fa-sun"></i> Modo Claro';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // Check saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    }

    // Modal
    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
}

// Routing / View Rendering
function renderView(view) {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    contentDisplay.innerHTML = '';
    contentDisplay.classList.remove('fade-in');
    void contentDisplay.offsetWidth; // Trigger reflow
    contentDisplay.classList.add('fade-in');
    const dataMap = {
        'dashboard': renderDashboard,
        'ediciones': () => renderSectionView('ediciones', festivalData.ediciones),
        'peliculas': () => renderSectionView('peliculas', festivalData.peliculas),
        'cineastas': () => renderSectionView('cineastas', festivalData.cineastas),
        'secciones': () => renderSectionView('secciones', festivalData.secciones),
        'eventos': () => renderSectionView('eventos', festivalData.eventos),
        'galardones': () => renderSectionView('galardones', festivalData.galardones),
        'sedes': () => renderSectionView('sedes', festivalData.sedes),
        'contacto': renderContactoView,
        'favoritos': renderFavoritosView
    };

    if (dataMap[view]) {
        dataMap[view]();
    } else {
        renderDashboard();
    }
}

// Helper to render content based on current mode
function renderModeContent(type, items) {
    if (currentMode === 'table') {
        renderTableView(type, items);
    } else if (currentMode === 'gallery') {
        renderGalleryView(type, items);
    } else if (currentMode === 'list') {
        renderListView(type, items);
    } else if (currentMode === 'kanban') {
        renderKanbanView(type, items);
    } else if (currentMode === 'calendar') {
        renderCalendarView(type, items);
    } else if (currentMode === 'map') {
        renderMapView(type, items);
    } else if (currentMode === 'dashboard') {
        renderSectionDashboard(type, items);
    } else {
        renderGridView(type, items);
    }
}

function renderContactoView() {
    const contacto = festivalData.contacto;
    contentDisplay.innerHTML = `
        <div class="contact-page fade-in">
            <div class="contact-hero">
                <h1 class="premium-title">Hablemos de Cine</h1>
                <p class="hero-subtitle">Conectando la historia del festival con su futuro. ¿En qué podemos ayudarte?</p>
            </div>
            
            <div class="contact-wrapper">
                <div class="contact-info-grid">
                    <div class="info-card glass-premium">
                        <div class="card-glow"></div>
                        <i class="fas fa-envelope-open-text card-icon"></i>
                        <h3>Escríbenos</h3>
                        <p>${contacto.email}</p>
                        <div class="card-footer">General & Prensa</div>
                    </div>
                    <div class="info-card glass-premium">
                        <div class="card-glow"></div>
                        <i class="fas fa-headset card-icon"></i>
                        <h3>Atención</h3>
                        <p>${contacto.telefono}</p>
                        <div class="card-footer">L-V: 09:00 - 18:00</div>
                    </div>
                    <div class="info-card glass-premium">
                        <div class="card-glow"></div>
                        <i class="fas fa-theater-masks card-icon"></i>
                        <h3>Sede</h3>
                        <p>${contacto.direccion}</p>
                        <div class="card-footer">Gijón, España</div>
                    </div>
                </div>

                <div class="contact-main-row">
                    <div class="form-container glass-premium">
                        <h2>Envía un mensaje</h2>
                        <form class="premium-form" onsubmit="event.preventDefault(); alert('Mensaje enviado (Simulación)');">
                            <div class="input-group">
                                <input type="text" required>
                                <label>Nombre</label>
                                <span class="bar"></span>
                            </div>
                            <div class="input-group">
                                <input type="email" required>
                                <label>Email</label>
                                <span class="bar"></span>
                            </div>
                            <div class="input-group">
                                <textarea required rows="4"></textarea>
                                <label>Tu mensaje...</label>
                                <span class="bar"></span>
                            </div>
                            <button class="btn-glow">
                                <span>Enviar Mensaje</span>
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>

                    <div class="map-container-premium glass-premium">
                        <div id="contact-map" style="height: 100%; min-height: 400px;"></div>
                        <div class="map-overlay-social">
                            <a href="${contacto.redes.instagram}" target="_blank" class="social-glass"><i class="fab fa-instagram"></i></a>
                            <a href="${contacto.redes.twitter}" target="_blank" class="social-glass"><i class="fab fa-twitter"></i></a>
                            <a href="${contacto.redes.facebook}" target="_blank" class="social-glass"><i class="fab fa-facebook-f"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        if (typeof L !== 'undefined') {
            const map = L.map('contact-map', { zoomControl: false }).setView([43.5414, -5.6615], 16);
            const isLight = document.body.classList.contains('light-theme');
            const tileUrl = isLight
                ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            L.tileLayer(tileUrl).addTo(map);
            L.marker([43.5414, -5.6615]).addTo(map);
        }
    }, 400);
}

// Generic Section Renderer (Universal Modes)
function renderSectionView(type, items) {
    const titles = {
        'ediciones': 'Ediciones del Festival',
        'peliculas': 'Películas',
        'cineastas': 'Cineastas',
        'secciones': 'Secciones',
        'eventos': 'Eventos y Galas',
        'galardones': 'Galardones',
        'sedes': 'Sedes'
    };

    contentDisplay.innerHTML = `
        <div class="view-header-flex">
            <h1 class="view-title">${titles[type]}</h1>
            ${type === 'cineastas' ? `
                <div class="section-filters" id="cineastas-filters">
                    <button class="filter-chip active" onclick="app.filterCineastas(this, 'Todos')">Todos</button>
                    <button class="filter-chip" onclick="app.filterCineastas(this, 'Director')">Directores</button>
                    <button class="filter-chip" onclick="app.filterCineastas(this, 'Actor')">Actores</button>
                    <button class="filter-chip" onclick="app.filterCineastas(this, 'Guionista')">Guionistas</button>
                    <button class="filter-chip" onclick="app.filterCineastas(this, 'Productor')">Productores</button>
                </div>
            ` : ''}
        </div>
    `;

    renderModeContent(type, items);
}

// Section Dashboard (Interactive Data)
function renderSectionDashboard(type, items) {
    const dash = document.createElement('div');
    dash.className = 'section-dashboard fade-in';

    let statsHtml = '';
    let chartHtml = '';

    if (type === 'peliculas') {
        const byCountry = {};
        items.forEach(p => byCountry[p.pais] = (byCountry[p.pais] || 0) + 1);
        const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 5);

        statsHtml = `
            <div class="interactive-data-row">
                <div class="data-bubble"><span class="label">Total Películas</span><span class="count">${items.length}</span></div>
                <div class="data-bubble"><span class="label">Países</span><span class="count">${Object.keys(byCountry).length}</span></div>
                <div class="data-bubble"><span class="label">Media Duración</span><span class="count">~95 min</span></div>
                <div class="data-bubble"><span class="label">Galardonadas</span><span class="count">${items.filter(p => p.galardones.length > 0).length}</span></div>
            </div>
        `;
        chartHtml = `
            <div class="dashboard-section-grid" style="margin-top: 3rem;">
                <div class="chart-container"><h3>Distribución por Países (Top 5)</h3><canvas id="sectionChart"></canvas></div>
                <div class="chart-container"><h3>Películas por Sección</h3><canvas id="sectionChart2"></canvas></div>
            </div>
        `;
    } else if (type === 'ediciones') {
        const totalAsistentes = items.reduce((acc, ed) => acc + (ed.estadisticas.asistentes || 0), 0);
        statsHtml = `
            <div class="interactive-data-row">
                <div class="data-bubble"><span class="label">Total Ediciones</span><span class="count">${items.length}</span></div>
                <div class="data-bubble"><span class="label">Total Espectadores</span><span class="count">${(totalAsistentes / 1000000).toFixed(1)}M</span></div>
                <div class="data-bubble"><span class="label">Media Pelis/Edición</span><span class="count">${Math.round(items.reduce((acc, e) => acc + e.estadisticas.peliculas, 0) / items.length)}</span></div>
                <div class="data-bubble"><span class="label">Años de Historia</span><span class="count">${new Date().getFullYear() - items[items.length - 1].año}</span></div>
            </div>
        `;
        chartHtml = `
            <div class="dashboard-section-grid" style="margin-top: 3rem;">
                <div class="chart-container dashboard-card-full"><h3>Evolución de Espectadores</h3><canvas id="sectionChart"></canvas></div>
            </div>
        `;
    } else if (type === 'cineastas') {
        const roles = {};
        items.forEach(c => c.cargos.forEach(role => roles[role] = (roles[role] || 0) + 1));
        statsHtml = `
            <div class="interactive-data-row">
                <div class="data-bubble"><span class="label">Total Cineastas</span><span class="count">${items.length}</span></div>
                <div class="data-bubble"><span class="label">Directores</span><span class="count">${roles['Director'] || 0}</span></div>
                <div class="data-bubble"><span class="label">Actores/Actrices</span><span class="count">${roles['Actor'] || roles['Actriz'] || 0}</span></div>
                <div class="data-bubble"><span class="label">Países de Origen</span><span class="count">${new Set(items.map(c => c.pais)).size}</span></div>
            </div>
        `;
        chartHtml = `
            <div class="dashboard-section-grid" style="margin-top: 3rem;">
                <div class="chart-container"><h3>Roles en el Festival</h3><canvas id="sectionChart"></canvas></div>
                <div class="chart-container"><h3>Top Países de Origen</h3><canvas id="sectionChart2"></canvas></div>
            </div>
        `;
    } else if (type === 'secciones') {
        statsHtml = `
            <div class="interactive-data-row">
                <div class="data-bubble"><span class="label">Total Secciones</span><span class="count">${items.length}</span></div>
                <div class="data-bubble"><span class="label">Pelis/Sección</span><span class="count">~${Math.round(festivalData.peliculas.length / items.length)}</span></div>
                <div class="data-bubble"><span class="label">Sección Top</span><span class="count">Albar</span></div>
            </div>
        `;
        chartHtml = `
            <div class="dashboard-section-grid" style="margin-top: 3rem;">
                <div class="chart-container"><h3>Películas por Sección (Total)</h3><canvas id="sectionChart"></canvas></div>
                <div class="chart-container"><h3>Evolución Festival-Sección</h3><canvas id="sectionChart2"></canvas></div>
            </div>
        `;
    } else {
        statsHtml = `
            <div class="interactive-data-row">
                <div class="data-bubble"><span class="label">Elementos</span><span class="count">${items.length}</span></div>
                <div class="data-bubble"><span class="label">Análisis de Datos</span><span class="count">LIVE</span></div>
            </div>
            <div style="padding: 4rem; text-align: center; background: var(--bg-card); border-radius: 20px; margin-top: 2rem;">
                <h3>Dashboard en construcción para esta sección</h3>
                <p style="color: var(--text-secondary)">Estamos procesando los datos históricos para ofrecerte las mejores estadísticas.</p>
            </div>
        `;
    }

    dash.innerHTML = statsHtml + chartHtml;
    contentDisplay.appendChild(dash);

    // Init charts if needed
    if (chartHtml) {
        setTimeout(() => initSectionCharts(type, items), 100);
    }
}

function initSectionCharts(type, items) {
    if (type === 'peliculas') {
        const byCountry = {};
        items.forEach(p => byCountry[p.pais] = (byCountry[p.pais] || 0) + 1);
        const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 5);

        new Chart(document.getElementById('sectionChart'), {
            type: 'bar',
            data: {
                labels: topCountries.map(c => c[0]),
                datasets: [{
                    label: 'Películas',
                    data: topCountries.map(c => c[1]),
                    backgroundColor: 'rgba(250, 204, 21, 0.6)',
                    borderColor: '#facc15',
                    borderWidth: 1
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }
        });

        const bySection = {};
        items.forEach(p => bySection[p.seccion] = (bySection[p.seccion] || 0) + 1);
        new Chart(document.getElementById('sectionChart2'), {
            type: 'pie',
            data: {
                labels: Object.keys(bySection),
                datasets: [{
                    data: Object.values(bySection),
                    backgroundColor: ['#facc15', '#38bdf8', '#fb7185', '#a78bfa', '#4ade80']
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
        });
    } else if (type === 'ediciones') {
        new Chart(document.getElementById('sectionChart'), {
            type: 'line',
            data: {
                labels: items.map(e => e.año).reverse(),
                datasets: [{
                    label: 'Espectadores',
                    data: items.map(e => e.estadisticas.asistentes).reverse(),
                    borderColor: '#facc15',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(250, 204, 21, 0.1)'
                }]
            },
            options: { responsive: true, scales: { y: { ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }
        });
    } else if (type === 'cineastas') {
        const roles = {};
        items.forEach(c => c.cargos.forEach(role => roles[role] = (roles[role] || 0) + 1));

        new Chart(document.getElementById('sectionChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(roles),
                datasets: [{
                    data: Object.values(roles),
                    backgroundColor: ['#facc15', '#38bdf8', '#fb7185', '#a78bfa']
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
        });

        const countries = {};
        items.forEach(c => countries[c.pais] = (countries[c.pais] || 0) + 1);
        const topC = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 5);
        new Chart(document.getElementById('sectionChart2'), {
            type: 'bar',
            data: {
                labels: topC.map(c => c[0]),
                datasets: [{
                    label: 'Cineastas',
                    data: topC.map(c => c[1]),
                    backgroundColor: '#38bdf8'
                }]
            },
            options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }
        });
    } else if (type === 'secciones') {
        // Count movies per section
        const sectionCounts = {};
        festivalData.peliculas.forEach(p => sectionCounts[p.seccion] = (sectionCounts[p.seccion] || 0) + 1);

        new Chart(document.getElementById('sectionChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(sectionCounts),
                datasets: [{
                    label: 'Películas',
                    data: Object.values(sectionCounts),
                    backgroundColor: 'rgba(56, 189, 248, 0.6)',
                    borderColor: '#38bdf8',
                    borderWidth: 1
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }
        });

        // Festival-Sección Evolution (Stacked bar)
        const editions = festivalData.ediciones.slice(0, 5).reverse(); // Last 5
        const labels = editions.map(e => e.numero + 'ª');
        const sections = [...new Set(festivalData.peliculas.map(p => p.seccion))];

        const datasets = sections.map((sec, i) => {
            return {
                label: sec,
                data: editions.map(e => festivalData.peliculas.filter(p => p.edicion_id === e.id && p.seccion === sec).length),
                backgroundColor: ['#facc15', '#38bdf8', '#fb7185', '#a78bfa', '#4ade80'][i % 5]
            };
        });

        new Chart(document.getElementById('sectionChart2'), {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                scales: {
                    x: { stacked: true, ticks: { color: '#94a3b8' } },
                    y: { stacked: true, ticks: { color: '#94a3b8' } }
                },
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } } }
            }
        });
    }
}

// Universal Grid View
function renderGridView(type, items) {
    const grid = document.createElement('div');
    grid.className = 'items-grid';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        const img = item.cartel || item.foto || `https://picsum.photos/seed/${item.id}/400/600`;
        const title = item.titulo || item.nombre || `${item.numero}ª Edición`;
        const subtitle = item.director || item.pais || item.fecha || '';

        card.innerHTML = `
            <img src="${img}" alt="${title}">
            <div class="item-info" style="${item.color ? `border-left: 4px solid ${item.color};` : ''}">
                <h4>${title}</h4>
                <p>${subtitle}${item.ciudad ? ` (${item.ciudad})` : ''}</p>
                ${item.cargos ? `<p class="accent-text" style="font-size: 0.8rem; color: var(--accent); margin-top: 4px;">${item.cargos.join(' • ')}</p>` : ''}
                ${item.año ? `<p style="color: ${item.color || 'var(--accent)'}; font-weight: 600;">Año ${item.año}</p>` : ''}
            </div>
        `;
        card.onclick = () => {
            if (type === 'secciones') {
                app.showMoviesBySection(item.nombre);
            } else {
                showDetail(type, item);
            }
        };
        grid.appendChild(card);
    });
    contentDisplay.appendChild(grid);
}

// Gallery View (Card Detail)
function renderGalleryView(type, items) {
    const gallery = document.createElement('div');
    gallery.className = 'items-gallery';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        const img = item.cartel || item.foto || `https://picsum.photos/seed/${item.id}/400/600`;
        const title = item.titulo || item.nombre || `${item.numero}ª Edición`;

        card.innerHTML = `
            <div class="gallery-img">
                <img src="${img}" alt="${title}">
            </div>
            <div class="gallery-content">
                <h3>${title}</h3>
                <p class="subtitle">${item.director || item.pais || item.fecha || ''}</p>
                <p class="desc">${item.sinopsis || item.resumen_anual || item.descripcion || ''}</p>
                <div class="gallery-footer">
                    ${item.año ? `<span><i class="fas fa-calendar"></i> ${item.año}</span>` : ''}
                    <button class="btn-primary" onclick="app.showDetailById('${type}', '${item.id}')">Ver más</button>
                </div>
            </div>
        `;
        gallery.appendChild(card);
    });
    contentDisplay.appendChild(gallery);
}

// Universal List View
function renderListView(type, items) {
    const list = document.createElement('div');
    list.className = 'items-list';

    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'item-list-row';
        const img = item.cartel || item.foto || `https://picsum.photos/seed/${item.id}/100/100`;
        const title = item.titulo || item.nombre || `${item.numero}ª Edición`;
        const subtitle = item.director || item.pais || item.fecha || '';

        row.innerHTML = `
            <img src="${img}" alt="${title}">
            <div class="item-info">
                <h4>${title}</h4>
                <p>${subtitle} ${item.año ? `(${item.año})` : ''}</p>
            </div>
        `;
        row.onclick = () => {
            if (type === 'secciones') {
                app.showMoviesBySection(item.nombre);
            } else {
                showDetail(type, item);
            }
        };
        list.appendChild(row);
    });
    contentDisplay.appendChild(list);
}

// Universal Table View
function renderTableView(type, items) {
    const table = document.createElement('table');
    table.className = 'data-table';

    let columns = [];
    if (type === 'peliculas') columns = [{ label: 'Título', key: 'titulo' }, { label: 'Director', key: 'director' }, { label: 'País', key: 'pais' }, { label: 'Sección', key: 'seccion' }];
    else if (type === 'ediciones') columns = [{ label: 'Nº', key: 'numero' }, { label: 'Año', key: 'año' }, { label: 'Director', key: 'director' }, { label: 'Pelis', key: 'estadisticas.peliculas' }];
    else if (type === 'cineastas') columns = [{ label: 'Nombre', key: 'nombre' }, { label: 'País', key: 'pais' }, { label: 'Películas', key: 'peliculas.length' }];
    else if (type === 'secciones') columns = [{ label: 'Nombre', key: 'nombre' }, { label: 'Años Activa', key: 'años_activa' }];
    else columns = [{ label: 'Nombre', key: 'nombre' }, { label: 'Información', key: 'fecha' }];

    // Sorting logic
    if (sortConfig.key) {
        items.sort((a, b) => {
            let valA = getNestedValue(a, sortConfig.key);
            let valB = getNestedValue(b, sortConfig.key);
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    table.innerHTML = `
        <thead>
            <tr>
                <th>Imagen</th>
                ${columns.map(c => `
                    <th onclick="app.setSort('${c.key}')" style="cursor: pointer">
                        ${c.label} ${sortConfig.key === c.key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                `).join('')}
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${items.map(item => {
        const img = item.cartel || item.foto || `https://picsum.photos/seed/${item.id}/50/50`;
        return `
                <tr>
                    <td><img src="${img}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                    ${type === 'peliculas' ? `<td>${item.titulo}</td><td>${item.director}</td><td>${item.pais}</td><td>${item.seccion}</td>` : ''}
                    ${type === 'ediciones' ? `<td>${item.numero}ª</td><td>${item.año}</td><td>${item.director}</td><td>${item.estadisticas.peliculas}</td>` : ''}
                    ${type === 'cineastas' ? `<td>${item.nombre}</td><td>${item.pais}</td><td>${item.peliculas.length}</td>` : ''}
                    ${type === 'secciones' ? `<td>${item.nombre}</td><td>${item.años_activa || 'N/A'}</td>` : ''}
                    ${!['peliculas', 'ediciones', 'cineastas', 'secciones'].includes(type) ? `<td>${item.nombre}</td><td>${item.fecha || item.descripcion || item.direccion || ''}</td>` : ''}
                    <td><button class="btn-text" onclick="${type === 'secciones' ? `app.showMoviesBySection('${item.nombre}')` : `app.showDetailById('${type}', '${item.id}')`}">Ver detalle</button></td>
                </tr>
            `}).join('')}
        </tbody>
    `;
    contentDisplay.appendChild(table);
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
}

// Universal Calendar View
function renderCalendarView(type, items) {
    const calendar = document.createElement('div');
    calendar.className = 'items-calendar';

    // Filter and sort by date
    const datedItems = items.filter(i => i.fecha || i.fecha_inicio).sort((a, b) => {
        const dateA = new Date(a.fecha || a.fecha_inicio);
        const dateB = new Date(b.fecha || b.fecha_inicio);
        return dateA - dateB;
    });

    if (datedItems.length === 0) {
        calendar.innerHTML = '<div style="padding: 3rem; text-align: center">No hay elementos con fecha para mostrar en el calendario de esta sección.</div>';
    } else {
        datedItems.forEach(item => {
            const date = new Date(item.fecha || item.fecha_inicio);
            const day = date.getDate();
            const month = date.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
            const title = item.titulo || item.nombre || `${item.numero}ª Edición`;

            const card = document.createElement('div');
            card.className = 'calendar-row';
            card.innerHTML = `
                <div class="calendar-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="calendar-info">
                    <h4>${title}</h4>
                    <p><i class="fas fa-clock"></i> ${item.lugar || item.pais || ''}</p>
                </div>
                <button class="btn-text" onclick="app.showDetailById('${type}', '${item.id}')">Detalles</button>
            `;
            calendar.appendChild(card);
        });
    }
    contentDisplay.appendChild(calendar);
}

// Universal Kanban View (Grouping)
function renderKanbanView(type, items) {
    const kanban = document.createElement('div');
    kanban.className = 'kanban-board';

    let groups = {};

    if (type === 'peliculas') {
        festivalData.secciones.forEach(s => groups[s.nombre] = []);
        items.forEach(p => { if (groups[p.seccion]) groups[p.seccion].push(p); });
    } else if (type === 'ediciones') {
        items.forEach(e => {
            const decade = Math.floor(e.año / 10) * 10 + 's';
            if (!groups[decade]) groups[decade] = [];
            groups[decade].push(e);
        });
    } else if (type === 'cineastas') {
        items.forEach(c => {
            if (!groups[c.pais]) groups[c.pais] = [];
            groups[c.pais].push(c);
        });
    } else if (type === 'eventos') {
        items.forEach(ev => {
            const tipo = ev.tipo || 'Otros';
            if (!groups[tipo]) groups[tipo] = [];
            groups[tipo].push(ev);
        });
    } else {
        groups['General'] = items;
    }

    Object.keys(groups).forEach(key => {
        if (groups[key].length === 0 && key !== 'General') return;

        const column = document.createElement('div');
        column.className = 'kanban-column glass';
        column.innerHTML = `<h3>${key} (${groups[key].length})</h3>`;

        groups[key].forEach(item => {
            const card = document.createElement('div');
            card.className = 'kanban-card';
            const title = item.titulo || item.nombre || `${item.numero}ª Edición`;
            const yearText = item.año ? `<span style="display: block; font-size: 0.75rem; color: var(--accent); margin-bottom: 4px;">${item.año}</span>` : '';
            card.innerHTML = `
                ${yearText}
                <p><strong>${title}</strong></p>
                <p style="font-size: 0.8rem; color: var(--text-secondary)">${item.director || item.pais || item.lugar || ''}</p>
            `;
            card.onclick = () => showDetail(type, item);
            column.appendChild(card);
        });
        kanban.appendChild(column);
    });
    contentDisplay.appendChild(kanban);
}

// Universal Map View
function renderMapView(type, items) {
    const mapDiv = document.createElement('div');
    mapDiv.id = 'map-container';
    mapDiv.style.height = '600px';
    mapDiv.style.borderRadius = '24px';
    mapDiv.style.marginTop = '1rem';
    contentDisplay.appendChild(mapDiv);

    if (type === 'sedes') {
        initLeafletMap(items.map(s => ({
            lat: s.coordenadas[0], lon: s.coordenadas[1], label: s.nombre, desc: s.direccion,
            type: 'sedes', id: s.id, img: `https://picsum.photos/seed/${s.id}/400/300`
        })));
    } else if (type === 'eventos') {
        initLeafletMap(items.map(ev => ({
            lat: ev.coordenadas[0], lon: ev.coordenadas[1], label: ev.nombre, desc: `${ev.fecha} - ${ev.lugar}`,
            type: 'eventos', id: ev.id, img: `https://picsum.photos/seed/${ev.id}/400/300`
        })));
    } else if (type === 'cineastas') {
        const markers = items.filter(c => c.coordenadas).map(c => ({
            lat: c.coordenadas[0],
            lon: c.coordenadas[1],
            label: c.nombre,
            desc: `${c.ciudad}, ${c.pais}`,
            type: 'cineastas',
            id: c.id,
            img: c.foto
        }));
        initLeafletMap(markers);
    } else if (type === 'peliculas') {
        // Group by country and show count
        const countryCounts = {};
        items.forEach(p => {
            if (!countryCounts[p.pais]) countryCounts[p.pais] = { count: 0, iso: p.iso_pais };
            countryCounts[p.pais].count++;
        });

        const mapData = [
            { country: 'España', lat: 40.4168, lon: -3.7038 },
            { country: 'Francia', lat: 48.8566, lon: 2.3522 },
            { country: 'Reino Unido', lat: 51.5074, lon: -0.1278 },
            { country: 'Portugal', lat: 38.7223, lon: -9.1393 },
            { country: 'Italia', lat: 41.9028, lon: 12.4964 }
        ];

        const markers = mapData.map(d => {
            const info = countryCounts[d.country];
            return info ? { lat: d.lat, lon: d.lon, label: d.country, desc: `${info.count} películas` } : null;
        }).filter(m => m);

        initLeafletMap(markers);
    } else if (type === 'ediciones') {
        initLeafletMap(items.map(e => ({ lat: 43.5414, lon: -5.6615, label: `${e.numero}ª Edición (${e.año})`, desc: `Director: ${e.director}` })), true);
    } else {
        mapDiv.innerHTML = '<div style="padding: 3rem; text-align: center">La vista de mapa no está disponible para esta sección todavía.</div>';
    }
}

function initLeafletMap(markers, zoomToGijon = false) {
    setTimeout(() => {
        const center = zoomToGijon ? [43.5414, -5.6615] : [43.54, -5.66];
        const zoom = zoomToGijon ? 14 : 2;
        const map = L.map('map-container').setView(center, zoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        markers.forEach(m => {
            const popupContent = `
                <div class="map-popup-content" onclick="app.showDetailById('${m.type}', '${m.id}')" style="cursor:pointer; min-width: 150px;">
                    ${m.img ? `<img src="${m.img}" style="width:100%; height: 100px; object-fit: cover; border-radius:8px; margin-bottom:8px;">` : ''}
                    <div style="color: #fff;">
                        <strong style="display:block; margin-bottom:4px;">${m.label}</strong>
                        <span style="font-size:0.85rem; opacity:0.8;">${m.desc}</span>
                        <div style="margin-top:8px; color:var(--accent); font-size:0.75rem; font-weight:600;">VER FICHA <i class="fas fa-arrow-right"></i></div>
                    </div>
                </div>
            `;
            L.marker([m.lat, m.lon]).addTo(map).bindPopup(popupContent);
        });

        if (markers.length > 0 && !zoomToGijon) {
            const group = new L.featureGroup(markers.map(m => L.marker([m.lat, m.lon])));
            map.fitBounds(group.getBounds().pad(0.5));
        }
    }, 100);
}

// Dashboard
function renderDashboard() {
    const lastEd = festivalData.ediciones[0];
    const totalPelis = festivalData.peliculas.length;
    const totalEd = festivalData.ediciones.length;

    contentDisplay.innerHTML = `
        <h1 class="view-title">Dashboard FICXtorico</h1>
        <div class="dashboard-grid">
            <div class="stat-card"><h3>Ediciones</h3><div class="value">${totalEd}</div></div>
            <div class="stat-card"><h3>Películas</h3><div class="value">${totalPelis}</div></div>
            <div class="stat-card"><h3>Asistentes 2023</h3><div class="value">${lastEd.estadisticas.asistentes.toLocaleString()}</div></div>
            <div class="stat-card"><h3>Sedes</h3><div class="value">${festivalData.sedes.length}</div></div>
        </div>
        <div class="charts-row">
            <div class="chart-container"><canvas id="mainChart"></canvas></div>
            <div class="chart-container"><canvas id="pieChart"></canvas></div>
        </div>
    `;

    initCharts();
}

function initCharts() {
    const ctx = document.getElementById('mainChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: festivalData.ediciones.map(e => e.año).reverse(),
            datasets: [{
                label: 'Espectadores',
                data: festivalData.ediciones.map(e => e.estadisticas.asistentes).reverse(),
                borderColor: '#facc15',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(250, 204, 21, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });

    const ctxPie = document.getElementById('pieChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Pelis', 'Cineastas', 'Sedes'],
            datasets: [{
                data: [festivalData.peliculas.length, festivalData.cineastas.length, festivalData.sedes.length],
                backgroundColor: ['#facc15', '#38bdf8', '#fb7185']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
        }
    });
}

// Detail Switching
function showDetail(type, item) {
    if (type === 'peliculas') showPeliculaDetail(item);
    else if (type === 'ediciones') showEdicionDetail(item);
    else if (type === 'cineastas') showCineastaDetail(item);
    else if (type === 'sedes') showSedeDetail(item);
    else if (type === 'galardones') showGalardonDetail(item);
    else {
        modalBody.innerHTML = `<h2>${item.nombre}</h2><p>${item.descripcion || item.direccion || ''}</p>`;
        modal.style.display = 'block';
    }
}

// Detail Views (Modals)
function findPrevNext(type, currentId) {
    const list = festivalData[type];
    const index = list.findIndex(item => item.id === currentId);
    return {
        prev: index > 0 ? list[index - 1] : null,
        next: index < list.length - 1 ? list[index + 1] : null
    };
}

function showEdicionDetail(item) {
    const { prev, next } = findPrevNext('ediciones', item.id);
    const relatedMovies = festivalData.peliculas.filter(p => p.edicion_id === item.id);
    const sectionsInEdition = [...new Set(relatedMovies.map(p => p.seccion))];

    const themeColor = item.color || 'var(--accent)';

    modalBody.innerHTML = `
        <div class="edition-detail fade-in" style="--edition-theme: ${themeColor}">
            <div class="edition-poster-container">
                <img src="${item.cartel}" alt="${item.numero}">
                <div class="edition-actions">
                    <a href="${item.web}" target="_blank" class="btn-primary" style="background: var(--edition-theme); color: #000;"><i class="fas fa-external-link-alt"></i> Web Oficial</a>
                    <a href="${item.programa}" target="_blank" class="btn-secondary" style="border-color: var(--edition-theme); color: var(--edition-theme);"><i class="fas fa-file-pdf"></i> Programa</a>
                </div>
            </div>
            <div class="edition-header-info">
                <div class="modal-nav">
                    ${prev ? `<button onclick="app.showDetailById('ediciones', '${prev.id}')"><i class="fas fa-chevron-left"></i> ${prev.numero}ª Edición</button>` : '<span></span>'}
                    ${next ? `<button onclick="app.showDetailById('ediciones', '${next.id}')">${next.numero}ª Edición <i class="fas fa-chevron-right"></i></button>` : '<span></span>'}
                </div>
                <h1>${item.numero}ª Edición</h1>
                <div class="year-tag" style="color: var(--edition-theme);">${item.año}</div>
                
                <div class="edition-summary-box">
                    <h3>Resumen del Año</h3>
                    <p>"${item.resumen_anual || 'Sin descripción disponible para esta edición histórica.'}"</p>
                </div>

                <div class="edition-meta-grid">
                    <div class="meta-item">
                        <span class="label">Director Artístico</span>
                        <span class="value">${item.director}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">Fechas de celebración</span>
                        <span class="value">${item.fecha_inicio ? `${formatDate(item.fecha_inicio)} - ${formatDate(item.fecha_fin)}` : 'Noviembre'}</span>
                    </div>
                </div>

                <div class="edition-stats-row">
                    <div class="stat-bubble"><strong>${item.estadisticas.peliculas}</strong> Películas Proyectadas</div>
                    <div class="stat-bubble"><strong>${item.estadisticas.cineastas}</strong> Cineastas Invitados</div>
                    <div class="stat-bubble"><strong>${item.estadisticas.sedes}</strong> Sedes</div>
                    <div class="stat-bubble"><strong>${item.estadisticas.asistentes.toLocaleString()}</strong> Espectadores</div>
                </div>
            </div>
        </div>

        ${relatedMovies.length > 0 ? `
            <div class="edition-movies-section">
                <div class="section-header-flex">
                    <h2 class="section-title"><i class="fas fa-film"></i> Películas de la ${item.numero}ª Edición</h2>
                    <div class="section-filters" id="edition-section-filters">
                        ${sectionsInEdition.map(sec => `
                            <button class="filter-chip" onclick="app.toggleEditionSection(this, '${sec}')">${sec}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="edition-movies-grid" id="edition-movies-grid">
                    ${relatedMovies.map(p => `
                        <div class="mini-movie-card glass" data-section="${p.seccion}" onclick="app.showDetailById('peliculas', '${p.id}')">
                            <img src="${p.cartel}" alt="${p.titulo}">
                            <div class="mini-info">
                                <h5>${p.titulo}</h5>
                                <p>${p.seccion} • ${p.director}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    modal.style.display = 'block';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
}

function showPeliculaDetail(p) {
    const { prev, next } = findPrevNext('peliculas', p.id);

    // Look for director profile
    const director = festivalData.cineastas.find(c => c.nombre === p.director);
    const directorHtml = director ? `
        <div class="director-mini-card" onclick="app.showDetailById('cineastas', '${director.id}')">
            <img src="${director.foto}" alt="${director.nombre}">
            <div>
                <p class="label">Director</p>
                <p class="name">${director.nombre}</p>
                <p class="view-profile">Ver perfil completo <i class="fas fa-arrow-right"></i></p>
            </div>
        </div>
    ` : `<p><strong>Director:</strong> ${p.director}</p>`;

    const editions = Array.isArray(p.edicion_id) ? p.edicion_id : [p.edicion_id];
    const sections = Array.isArray(p.seccion) ? p.seccion : [p.seccion];

    const editionsHtml = editions.map(id => {
        const ed = festivalData.ediciones.find(e => e.id === id);
        if (!ed) return '';
        return `<span class="detail-link-pill" onclick="modal.style.display='none'; app.showDetailById('ediciones', '${ed.id}')">
            <i class="fas fa-history"></i> ${ed.numero}ª Edición (${ed.año})
        </span>`;
    }).join('');

    const sectionsHtml = sections.map(sec => {
        return `<span class="detail-link-pill" onclick="modal.style.display='none'; app.showMoviesBySection('${sec}')">
            <i class="fas fa-layer-group"></i> ${sec}
        </span>`;
    }).join('');

    modalBody.innerHTML = `
        <div class="modal-nav">
            ${prev ? `<button onclick="app.showDetailById('peliculas', '${prev.id}')"><i class="fas fa-chevron-left"></i> Anterior</button>` : '<span></span>'}
            ${next ? `<button onclick="app.showDetailById('peliculas', '${next.id}')">Siguiente <i class="fas fa-chevron-right"></i></button>` : '<span></span>'}
        </div>
        <div class="detail-container">
            <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                <img src="${p.cartel}" style="width: 300px; border-radius: 12px; box-shadow: var(--shadow);">
                <div class="detail-info" style="flex: 1; min-width: 300px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h2 style="margin: 0;">${p.titulo}</h2>
                        <button class="fav-toggle ${app.isFavorite('peliculas', p.id) ? 'active' : ''}" onclick="app.toggleFavorite('peliculas', '${p.id}')" style="background: none; border: none; color: ${app.isFavorite('peliculas', p.id) ? 'var(--accent)' : 'var(--text-secondary)'}; cursor: pointer; font-size: 1.5rem;">
                            <i class="fa${app.isFavorite('peliculas', p.id) ? 's' : 'r'} fa-heart"></i>
                        </button>
                    </div>
                    
                    <div class="detail-pills-row" style="margin: 1rem 0;">
                        ${editionsHtml}
                        ${sectionsHtml}
                    </div>

                    <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1.5rem;">${p.pais} | ${p.duracion}</p>
                    
                    ${directorHtml}
                    
                    <p style="margin-top: 1.5rem;">${p.sinopsis}</p>
                    <div style="margin-top: 1rem;"><strong>Plataformas:</strong> ${p.plataformas.join(', ')}</div>
                    <div style="margin-top: 1rem;"><strong>Galardones:</strong> ${p.galardones.map(g => `<span style="color: var(--accent); margin-right: 10px;"><i class="fas fa-trophy"></i> ${g}</span>`).join('')}</div>
                </div>
            </div>
            <div style="margin-top: 2rem;"><h3>Trailer</h3><iframe width="100%" height="400" src="${p.trailer}" frameborder="0" allowfullscreen style="border-radius: 12px; margin-top: 1rem;"></iframe></div>
        </div>
    `;
    modal.style.display = 'block';
}

function showCineastaDetail(c) {
    const { prev, next } = findPrevNext('cineastas', c.id);

    // Find related films
    const relatedFilms = festivalData.peliculas.filter(p => c.peliculas.includes(p.id));

    const filmsHtml = relatedFilms.length > 0
        ? `
            <div style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">Filmografía en el Festival</h3>
                <div class="filmography-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                    ${relatedFilms.map(p => `
                        <div class="film-item glass" onclick="app.showDetailById('peliculas', '${p.id}')" style="cursor: pointer; padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 15px; transition: var(--transition);">
                            <img src="${p.cartel}" style="width: 60px; height: 90px; object-fit: cover; border-radius: 6px;">
                            <div>
                                <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">${p.titulo}</div>
                                <div style="font-size: 0.85rem; color: var(--accent);">${p.seccion}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

    modalBody.innerHTML = `
        <div class="modal-nav">
            ${prev ? `<button onclick="app.showDetailById('cineastas', '${prev.id}')"><i class="fas fa-chevron-left"></i> Anterior</button>` : '<span></span>'}
            ${next ? `<button onclick="app.showDetailById('cineastas', '${next.id}')">Siguiente <i class="fas fa-chevron-right"></i></button>` : '<span></span>'}
        </div>
        <div class="detail-container">
            <div style="display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start;">
                <div style="position: relative;">
                    <img src="${c.foto}" style="width: 220px; height: 220px; border-radius: 24px; object-fit: cover; box-shadow: var(--shadow);">
                </div>
                <div class="detail-info" style="flex: 1; min-width: 300px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h1 style="font-size: 2.5rem; margin: 0 0 0.5rem 0;">${c.nombre}</h1>
                        <button class="fav-toggle ${app.isFavorite('cineastas', c.id) ? 'active' : ''}" onclick="app.toggleFavorite('cineastas', '${c.id}')" style="background: none; border: none; color: ${app.isFavorite('cineastas', c.id) ? 'var(--accent)' : 'var(--text-secondary)'}; cursor: pointer; font-size: 1.5rem;">
                            <i class="fa${app.isFavorite('cineastas', c.id) ? 's' : 'r'} fa-heart"></i>
                        </button>
                    </div>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                        <span style="background: var(--accent); color: var(--bg-dark); padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; text-transform: uppercase;">
                            ${c.cargos.join(' / ')}
                        </span>
                        <span style="color: var(--text-secondary); font-size: 1rem; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-map-marker-alt"></i> ${c.ciudad}, ${c.pais}
                        </span>
                    </div>
                    <p style="line-height: 1.8; font-size: 1.1rem; color: var(--text-secondary);">${c.biografia}</p>
                </div>
            </div>
            ${filmsHtml}
        </div>
    `;
    modal.style.display = 'block';
}

// Search Logic
function handleSearch(query) {
    if (!query) { renderView(currentView); return; }
    const q = query.toLowerCase();
    contentDisplay.innerHTML = `<h1 class="view-title">Búsqueda: "${query}"</h1>`;
    const grid = document.createElement('div');
    grid.className = 'items-grid';

    const pelis = festivalData.peliculas.filter(p => p.titulo.toLowerCase().includes(q) || p.director.toLowerCase().includes(q));
    const cineastas = festivalData.cineastas.filter(c => c.nombre.toLowerCase().includes(q));
    const eds = festivalData.ediciones.filter(e => e.año.toString().includes(q) || e.director.toLowerCase().includes(q));

    [...pelis, ...cineastas, ...eds].forEach(item => {
        const type = item.titulo ? 'peliculas' : (item.numero ? 'ediciones' : 'cineastas');
        const img = item.cartel || item.foto || `https://picsum.photos/seed/${item.id}/400/600`;
        const title = item.titulo || item.nombre || `${item.numero}ª Edición`;
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `<img src="${img}"><h4>${title}</h4>`;
        card.onclick = () => {
            if (type === 'secciones') {
                app.showMoviesBySection(item.nombre);
            } else {
                showDetail(type, item);
            }
        };
        grid.appendChild(card);
    });
    contentDisplay.appendChild(grid);
}

// Global Export
window.app = {
    favorites: JSON.parse(localStorage.getItem('ficx_favorites')) || { peliculas: [], cineastas: [] },

    toggleFavorite: function (type, id) {
        if (!this.favorites[type]) this.favorites[type] = [];
        const index = this.favorites[type].indexOf(id);
        if (index === -1) {
            this.favorites[type].push(id);
        } else {
            this.favorites[type].splice(index, 1);
        }
        localStorage.setItem('ficx_favorites', JSON.stringify(this.favorites));

        const item = festivalData[type].find(i => i.id === id);
        if (item) showDetail(type, item);

        if (currentView === 'favoritos') renderView('favoritos');
    },

    isFavorite: function (type, id) {
        return this.favorites[type] && this.favorites[type].includes(id);
    },

    showDetailById: function (type, id) {
        const item = festivalData[type].find(i => i.id === id);
        if (item) showDetail(type, item);
    },
    showMoviesBySection: (sectionName) => {
        currentView = 'peliculas';
        // Update sidebar active link
        navLinks.forEach(l => {
            l.classList.remove('active');
            if (l.dataset.view === 'peliculas') l.classList.add('active');
        });

        renderView('peliculas');
        // Filter movies after rendering view
        const filteredPelis = festivalData.peliculas.filter(p => p.seccion === sectionName);
        contentDisplay.innerHTML = `<h1 class="view-title">Películas en sección: ${sectionName}</h1>`;
        renderGridView('peliculas', filteredPelis);

        // Add a back button
        const backBtn = document.createElement('button');
        backBtn.className = 'btn-text';
        backBtn.style.marginBottom = '2rem';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a secciones';
        backBtn.onclick = () => renderView('secciones');
        contentDisplay.prepend(backBtn);
    },
    setSort: (key) => {
        if (sortConfig.key === key) {
            sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortConfig.key = key;
            sortConfig.direction = 'asc';
        }
        renderView(currentView);
    },
    toggleEditionSection: (btn, section) => {
        btn.classList.toggle('active');
        const grid = document.getElementById('edition-movies-grid');
        const movies = grid.querySelectorAll('.mini-movie-card');
        const activeChips = document.querySelectorAll('#edition-section-filters .filter-chip.active');
        const activeSections = Array.from(activeChips).map(c => c.textContent);

        movies.forEach(movie => {
            if (activeSections.length === 0 || activeSections.includes(movie.dataset.section)) {
                movie.style.display = 'block';
            } else {
                movie.style.display = 'none';
            }
        });
    },
    filterCineastas: (btn, category) => {
        const filters = document.getElementById('cineastas-filters');
        filters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');

        const filtered = category === 'Todos'
            ? festivalData.cineastas
            : festivalData.cineastas.filter(c => c.cargos.includes(category));

        // Remove everything except the header
        const header = contentDisplay.querySelector('.view-header-flex');
        while (header.nextSibling) {
            contentDisplay.removeChild(header.nextSibling);
        }

        renderModeContent('cineastas', filtered);
    },
};


function showSedeDetail(item) {
    modalBody.innerHTML = `
        <div class="sede-detail fade-in">
            <div class="sede-header">
                <div class="sede-image-box">
                    <img src="${item.imagen || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=1000'}" alt="${item.nombre}">
                    <div class="sede-overlay">
                        <h1>${item.nombre}</h1>
                    </div>
                </div>
            </div>
            
            <div class="sede-content-grid">
                <div class="sede-info-column">
                    <div class="info-card glass">
                        <div class="info-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <h3>Dirección</h3>
                                <p>${item.direccion}</p>
                            </div>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-phone"></i>
                            <div>
                                <h3>Teléfono</h3>
                                <p>${item.telefono || 'No disponible'}</p>
                            </div>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-users"></i>
                            <div>
                                <h3>Aforo</h3>
                                <p>${item.aforo ? `${item.aforo.toLocaleString()} personas` : 'No disponible'}</p>
                            </div>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-location-arrow"></i>
                            <div>
                                <h3>Coordenadas GPS</h3>
                                <p>${item.coordenadas ? `${item.coordenadas[0]}, ${item.coordenadas[1]}` : 'No disponibles'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="sede-map-column">
                    <div id="sede-detail-map" class="glass" style="height: 300px; border-radius: 15px;"></div>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'block';

    setTimeout(() => {
        if (typeof L !== 'undefined' && item.coordenadas) {
            const detailMap = L.map('sede-detail-map', { zoomControl: false }).setView(item.coordenadas, 16);
            const isLight = document.body.classList.contains('light-theme');
            const tileUrl = isLight
                ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

            L.tileLayer(tileUrl).addTo(detailMap);
            L.marker(item.coordenadas).addTo(detailMap)
                .bindPopup(`<strong>${item.nombre}</strong>`)
                .openPopup();
        }
    }, 300);
}
function showGalardonDetail(item) {
    const winners = [];
    festivalData.ediciones.forEach(ed => {
        if (ed.galardones) {
            ed.galardones.forEach(g => {
                if (g.premio === item.nombre) {
                    const movie = festivalData.peliculas.find(p => p.titulo === g.ganador);
                    winners.push({
                        edicion: ed.numero,
                        año: ed.año,
                        ganador: g.ganador,
                        pelicula: movie
                    });
                }
            });
        }
    });

    modalBody.innerHTML = `
        <div class="award-detail fade-in">
            <div class="award-header glass">
                <i class="fas fa-trophy award-icon-main"></i>
                <div>
                    <span class="category-tag">${item.categoria}</span>
                    <h1>${item.nombre}</h1>
                </div>
            </div>
            
            <div class="award-description glass">
                <h3>Acerca de este galardón</h3>
                <p>${item.descripcion || 'Este es uno de los prestigiosos premios otorgados durante el Festival Internacional de Cine de Gijón (FICX).'}</p>
            </div>

            <div class="winners-section">
                <h2>Histórico de Ganadores</h2>
                <div class="winners-list">
                    ${winners.length > 0 ? winners.map(w => `
                        <div class="winner-row glass" ${w.pelicula ? `onclick="app.showDetailById('peliculas', '${w.pelicula.id}')"` : ''} style="cursor: ${w.pelicula ? 'pointer' : 'default'}">
                            <div class="winner-ed">
                                <span class="ed-num">${w.edicion}ª FICX</span>
                                <span class="ed-year">${w.año}</span>
                            </div>
                            <div class="winner-info">
                                <span class="winner-name">${w.ganador}</span>
                                ${w.pelicula ? `<span class="view-hint">Ver película <i class="fas fa-chevron-right"></i></span>` : ''}
                            </div>
                        </div>
                    `).join('') : '<p class="no-data">No se han registrado ganadores históricos en el archivo para este premio todavía.</p>'}
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

function renderFavoritosView() {
    const favPelis = festivalData.peliculas.filter(p => app.isFavorite('peliculas', p.id));
    const favCineastas = festivalData.cineastas.filter(c => app.isFavorite('cineastas', c.id));

    contentDisplay.innerHTML = `
        <div class="favoritos-page fade-in">
            <div class="fav-hero glass">
                <div class="fav-hero-content">
                    <div class="fav-icon-bg"><i class="fas fa-heart"></i></div>
                    <h1>Mi Colección</h1>
                    <p>Películas y cineastas que han dejado huella en tu paso por el FICX.</p>
                </div>
            </div>

            <div class="fav-sections-container">
                <section class="fav-category">
                    <div class="category-header">
                        <h2><i class="fas fa-film"></i> Películas Guardadas</h2>
                        <span class="count-badge">${favPelis.length}</span>
                    </div>
                    <div class="fav-grid">
                        ${favPelis.length > 0 ? favPelis.map(p => renderFavItemCard('peliculas', p)).join('') : `
                            <div class="empty-fav glass">
                                <i class="fas fa-film"></i>
                                <p>Aún no has guardado ninguna película</p>
                            </div>
                        `}
                    </div>
                </section>

                <section class="fav-category">
                    <div class="category-header">
                        <h2><i class="fas fa-user-tie"></i> Cineastas Guardados</h2>
                        <span class="count-badge">${favCineastas.length}</span>
                    </div>
                    <div class="fav-grid">
                        ${favCineastas.length > 0 ? favCineastas.map(c => renderFavItemCard('cineastas', c)).join('') : `
                            <div class="empty-fav glass">
                                <i class="fas fa-user-circle"></i>
                                <p>Aún no has guardado ningún cineasta</p>
                            </div>
                        `}
                    </div>
                </section>
            </div>
        </div>
    `;
}

function renderFavItemCard(type, item) {
    const isPeli = type === 'peliculas';
    const title = isPeli ? item.titulo : item.nombre;
    const sub = isPeli ? `${item.director} • ${item.año}` : (item.cargos ? item.cargos[0] : 'Cineasta');
    const img = isPeli ? item.cartel : item.foto;

    return `
        <div class="fav-card glass" onclick="app.showDetailById('${type}', '${item.id}')">
            <div class="fav-card-img">
                <img src="${img}" alt="${title}">
                <button class="fav-remove-btn" onclick="event.stopPropagation(); app.toggleFavorite('${type}', '${item.id}')" title="Eliminar de favoritos">
                    <i class="fas fa-heart-broken"></i>
                </button>
            </div>
            <div class="fav-card-info">
                <h3>${title}</h3>
                <p>${sub}</p>
            </div>
        </div>
    `;
}
init();
