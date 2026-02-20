
// Funcionalidad de las pestañas con cambio de contenido
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
        const tabType = this.getAttribute('data-tab');

        // Remover active de todas las pestañas
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Ocultar todas las secciones de contenido
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar la sección correspondiente
        if (tabType === 'branches') {
            document.getElementById('branchesSection').classList.add('active');
        } else if (tabType === 'products') {
            document.getElementById('productsSection').classList.add('active');
        } else if (tabType === 'weather') {
            document.getElementById('weatherSection').classList.add('active');
            loadWeatherForecast();
        } else if (tabType === 'fuel') {
            document.getElementById('fuelSection').classList.add('active');
        }
    });
});

// Manejo del menú lateral: cerrar menú y activar pestañas cuando el enlace tenga data-tab
function setupSideMenuLinks() {
    const menuOverlay = document.getElementById('menuOverlay');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenuBtn = document.getElementById('closeMenu');

    function closeMenu() {
        if (menuOverlay) menuOverlay.classList.remove('visible');
        if (sideMenu) sideMenu.classList.remove('open');
        sideMenu?.removeAttribute('inert');
    }

    // Delegación: añadir listener a cada enlace del menú
    document.querySelectorAll('.side-menu__item').forEach(link => {
        link.addEventListener('click', function (e) {
            const tab = this.getAttribute('data-tab');
            const href = this.getAttribute('href') || '';
            const isExternal = /^https?:\/\//i.test(href);

            // Si tiene data-tab, activamos la pestaña correspondiente
            if (tab) {
                e.preventDefault();
                const targetTab = document.querySelector('.tab[data-tab="' + tab + '"]');
                if (targetTab) targetTab.click();
                closeMenu();
                return;
            }

            // Si es un enlace externo (http/https), forzamos apertura segura
            if (isExternal) {
                // Detectar entornos donde _blank puede ser bloqueado (PWA / in-app webview)
                const isStandalone = (window.navigator && window.navigator.standalone) ||
                    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                    /WebView|wv|FBAN|FBAV|Instagram|Line|FB_IAB|FB4A/i.test(navigator.userAgent || '');

                // Cerrar el menú primero para evitar interferencias visuales en webviews móviles
                closeMenu();

                try {
                    if (isStandalone) {
                        // En PWA o webviews mejor navegar en la misma ventana
                        window.location.href = href;
                    } else {
                        const newWin = window.open(href, '_blank', 'noopener,noreferrer');
                        // Si window.open fue bloqueado (retorna null), navegar en la misma ventana
                        if (!newWin) window.location.href = href;
                    }
                } catch (err) {
                    // Fallback: navegar en la misma pestaña
                    window.location.href = href;
                }
                // Cerrar el menú después de iniciar la navegación
                closeMenu();
                e.preventDefault();
                return;
            }

            // Enlaces internos: simplemente cerrar el menú
            closeMenu();
        });
    });

    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
}

// Ejecutar setup cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSideMenuLinks);
} else {
    setupSideMenuLinks();
}

// Productos: búsqueda simple en la cuadrícula
(function setupProductSearch() {
    const input = document.getElementById('productSearchInput');
    const grid = document.getElementById('productGrid');
    if (!input || !grid) return;

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        const links = grid.querySelectorAll('a');
        links.forEach(link => {
            const name = (link.dataset.name || '').toLowerCase();
            if (!q || name.includes(q)) {
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        });
    });
})();

// Mapa de Sucursales
let branchesMap = null;
let branchesMarkers = []; // quedará vacío cuando usemos iframe

const branches = [
    {
        name: "Casa Matriz",
        address: "San Alberto, Paraguay",
        phone: "+595 XXX XXXX",
        email: "info@iasa.com.py",
        lat: -24.9799664,
        lng: -54.9113394,
        hours: "Lun-Vie: 8:00-18:00, Sáb: 9:00-13:00",
        embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1024.8206157787336!2d-54.91191832354434!3d-24.979718458562427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94f5b10075e17273%3A0x504e54907328599b!2sIasa!5e1!3m2!1ses!2spy!4v1765375324725!5m2!1ses!2spy"
    },
    {
        name: "Itakyry",
        address: "Itakyry",
        phone: "",
        email: "",
        lat: -24.96338147868354,
        lng: -55.25542300071265,
        embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1378.2204152513136!2d-55.25542300071265!3d-24.96338147868354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94f59b95546fffff%3A0xe6c9e1b2166a569e!2sIASA%20-%20Inversiones%20Agr%C3%ADcolas%20SA!5e1!3m2!1ses!2spy!4v1765374639367!5m2!1ses!2spy"
    },
    {
        name: "Mbaracayú",
        address: "Mbaracayú",
        phone: "",
        email: "",
        lat: -25.026370509862502,
        lng: -54.815900433120945,
        embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d724.382481106149!2d-54.815900433120945!3d-25.026370509862502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94f5b4e48f296ed7%3A0x9653333056a21aa5!2sINVERSIONES%20AGR%C3%8DCOLAS%20SA!5e1!3m2!1ses!2spy!4v1765374717026!5m2!1ses!2spy"
    },
    {
        name: "Gleba 8",
        address: "Gleba 8",
        phone: "",
        email: "",
        lat: -24.867397472307896,
        lng: -55.03378799074861,
        embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1725.1067418166904!2d-55.03378799074861!3d-24.867397472307896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94f5a79bd55c0d6d%3A0x19b93fd8f410cae0!2sIASA%20-%20INVERSIONES%20AGRICOLAS%20S.A.%20-%20GLEBA%208!5e1!3m2!1ses!2spy!4v1765374832305!5m2!1ses!2spy"
    },
    {
        name: "Santa Fe",
        address: "Santa Fe",
        phone: "",
        email: "",
        lat: -25.21838630007443,
        lng: -54.697545468807185,
        embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1635.5774448638485!2d-54.697545468807185!3d-25.21838630007443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94f42e09adbecf6f%3A0xdc4fd4fabe0fe3a!2sIASA%20Santa%20Fe%20-%20Inversiones%20Agricolas%20S.A.!5e1!3m2!1ses!2spy!4v1765374937497!5m2!1ses!2spy"
    }
    ,
    {
        name: "Guadalupe",
        address: "Guadalupe",
        phone: "",
        email: "",
        lat: -24.27334436604479,
        lng: -54.46159738188292,
        embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2417.7683919349433!2d-54.46159738188292!3d-24.27334436604479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94f4c10058bad7ff%3A0xbc0c59f0aeaf3230!2sIASA%20Inversiones%20Agr%C3%ADcolas%20S.A%20Guadalupe!5e1!3m2!1ses!2spy!4v1765376805717!5m2!1ses!2spy"
    },
    {
        name: "Katueté",
        address: "Katueté",
        phone: "",
        email: "",
        lat: -24.25801318403414,
        lng: -54.80940632671559,
        embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1165.4946624732947!2d-54.80940632671559!3d-24.25801318403414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94f527a4611590c9%3A0x938ce5af564cc3b8!2sIASA!5e1!3m2!1ses!2spy!4v1765376883516!5m2!1ses!2spy"
    },
    {
        name: "Bella Vista",
        address: "Bella Vista",
        phone: "",
        email: "",
        lat: -27.033156498535963,
        lng: -55.579511430453124,
        embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d805.1816818384511!2d-55.579511430453124!3d-27.033156498535963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9457fdd74ecc1c95%3A0x679943497bb3b1d8!2sEdificio%20W.%20Schneider!5e1!3m2!1ses!2spy!4v1765378476142!5m2!1ses!2spy"
    }
];

function initBranchesMap() {
    if (branchesMap) {
        branchesMap.invalidateSize();
        return;
    }

    // Inicializar el mapa centrado en IASA Itapúa, Paraguay
    branchesMap = L.map('branchesMap').setView([-24.9799664, -54.9113394], 17);

    // Agregar capas base: Satélite (por defecto) y Calles
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });

    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri — Fuente: Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
    });

    // Añadir la capa satelital por defecto
    satLayer.addTo(branchesMap);

    // Añadir control para alternar entre Satélite y Calles
    const baseLayers = {
        "Satelital": satLayer,
        "Calles": streetLayer
    };
    L.control.layers(baseLayers, null, { collapsed: false }).addTo(branchesMap);

    // Agregar marcadores para cada sucursal
    branches.forEach((branch, index) => {
        const marker = L.marker([branch.lat, branch.lng]).addTo(branchesMap);

        const popupContent = `
                    <div style="font-family: 'Segoe UI', Roboto, sans-serif;">
                        <h4 style="margin: 0 0 10px 0; color: #3c318f;">${branch.name}</h4>
                        <p style="margin: 5px 0;"><strong>📍</strong> ${branch.address}</p>
                        <p style="margin: 5px 0;"><strong>📞</strong> ${branch.phone}</p>
                        <p style="margin: 5px 0;"><strong>✉️</strong> ${branch.email}</p>
                        <p style="margin: 5px 0;"><strong>🕒</strong> ${branch.hours}</p>
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}" 
                           target="_blank" 
                           style="display: inline-block; margin-top: 10px; padding: 8px 12px; background: #3c318f; color: white; text-decoration: none; border-radius: 5px;">
                            Cómo llegar
                        </a>
                    </div>
                `;

        marker.bindPopup(popupContent);
        branchesMarkers.push(marker);
    });

    // Renderizar la lista de sucursales
    renderBranchesList();
}

function renderBranchesList() {
    const listContainer = document.getElementById('branchesListItems');
    if (!listContainer) return;

    const html = branches.map((branch, index) => `
                <div class="news-item" style="cursor: pointer; transition: transform 0.2s;" 
                     onmouseover="this.style.transform='scale(1.02)'" 
                     onmouseout="this.style.transform='scale(1)'"
                     onclick="showBranchMap(${index})">
                    <div class="news-content">
                        <div class="news-title">${branch.name}</div>
                        <div class="activity-description">
                            <p style="margin: 5px 0;">📍 ${branch.address}</p>
                            <p style="margin: 5px 0;">📞 ${branch.phone}</p>
                            <p style="margin: 5px 0;">🕒 ${branch.hours}</p>
                        </div>
                    </div>
                </div>
            `).join('');

    listContainer.innerHTML = html;
}

function showBranchMap(index) {
    const branch = branches[index];
    if (!branch) return;
    const iframe = document.getElementById('branchIframe');
    if (!iframe) return;
    // Construir URL por coordenadas para evitar el cuadro de información (info window)
    const lat = encodeURIComponent(branch.lat);
    const lng = encodeURIComponent(branch.lng);
    // Usar coordenadas en la query y solicitar vista satelital con `t=k` (si está disponible)
    const url = `https://maps.google.com/maps?q=loc:${lat},${lng}&z=18&t=k&output=embed&hl=es`;
    iframe.src = url;
    iframe.style.display = '';

    // Desplazar suavemente hacia el mapa
    const container = document.getElementById('branchesMap');
    container?.scrollIntoView({ behavior: 'smooth' });
}

// Inicializar controles al cargar la página (la lista visual está oculta)
document.addEventListener('DOMContentLoaded', () => {
    renderBranchesSelect();
    setupBranchControls();
    // Mostrar mapa de la sucursal por defecto (primera)
    if (branches && branches.length > 0) {
        showBranchMap(0);
    }
});

function renderBranchesSelect() {
    const sel = document.getElementById('branchesSelect');
    if (!sel) return;
    // Poblar opciones y seleccionar la primera sucursal por defecto
    sel.innerHTML = branches.map((b, i) => `<option value="${i}">${escapeHtml(b.name)}</option>`).join('');
    sel.value = '0';
}

function setupBranchControls() {
    const sel = document.getElementById('branchesSelect');
    if (sel) sel.addEventListener('change', (e) => {
        const idx = e.target.value;
        if (idx !== '') {
            // Mostrar mapa automáticamente al cambiar la selección
            showBranchMap(Number(idx));
        }
    });
}

// Inicializar el mapa cuando la página carga
// Ya usamos iframe para el mapa; no se inicializa Leaflet al cargar.


// Open-Meteo API
// https://open-meteo.com/
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// Función para obtener el icono del clima según el código de Open-Meteo
function getWeatherIcon(weatherCode) {
    // Códigos de Open-Meteo Weather Code (WMO)
    // 0 = Clear sky, 1-3 = Mainly clear/partly cloudy/overcast
    // 45-48 = Fog, 51-67 = Drizzle/Rain, 71-77 = Snow, 80-99 = Rain showers/Thunderstorm
    if (weatherCode >= 95 && weatherCode <= 99) {
        // Tormenta
        return `<svg class="icon" viewBox="0 0 24 24">
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                    <path d="M8 12h8M12 8v8"></path>
                </svg>`;
    } else if (weatherCode >= 80 && weatherCode <= 94) {
        // Lluvia con truenos / Lluvia fuerte
        return `<svg class="icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
                    <path d="M8 12h8M12 8v8"></path>
                </svg>`;
    } else if (weatherCode >= 51 && weatherCode <= 67) {
        // Lluvia
        return `<svg class="icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
                    <path d="M8 12h8M12 8v8"></path>
                </svg>`;
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        // Nieve
        return `<svg class="icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M8 12h8M12 8v8M6 6l12 12M18 6L6 18"></path>
                </svg>`;
    } else if (weatherCode >= 45 && weatherCode <= 48) {
        // Niebla
        return `<svg class="icon" viewBox="0 0 24 24">
                    <path d="M4 12h16M8 8h8M6 16h12" stroke-width="1.5" opacity="0.6"></path>
                </svg>`;
    } else if (weatherCode === 0) {
        // Despejado
        return `<svg class="icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
                </svg>`;
    } else if (weatherCode >= 1 && weatherCode <= 3) {
        // Parcialmente nublado / Nublado
        return `<svg class="icon" viewBox="0 0 24 24">
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                    <circle cx="12" cy="12" r="4"></circle>
                </svg>`;
    }
    // Por defecto, sol
    return `<svg class="icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
            </svg>`;
}

// Función para obtener la descripción del clima
function getWeatherDescription(weatherCode) {
    const descriptions = {
        0: 'Cielo despejado',
        1: 'Principalmente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla helada',
        51: 'Llovizna ligera',
        53: 'Llovizna moderada',
        55: 'Llovizna densa',
        56: 'Llovizna helada ligera',
        57: 'Llovizna helada densa',
        61: 'Lluvia ligera',
        63: 'Lluvia moderada',
        65: 'Lluvia fuerte',
        66: 'Lluvia helada ligera',
        67: 'Lluvia helada fuerte',
        71: 'Nieve ligera',
        73: 'Nieve moderada',
        75: 'Nieve fuerte',
        77: 'Granizo de nieve',
        80: 'Chubascos ligeros',
        81: 'Chubascos moderados',
        82: 'Chubascos fuertes',
        85: 'Chubascos de nieve ligeros',
        86: 'Chubascos de nieve fuertes',
        95: 'Tormenta',
        96: 'Tormenta con granizo leve',
        99: 'Tormenta con granizo fuerte'
    };
    return descriptions[weatherCode] || 'Condiciones variables';
}

// Función para formatear el nombre del día
function getDayName(date, index) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    if (index === 0) return 'Hoy';
    if (index === 1) return 'Mañana';
    const dayIndex = date.getDay();
    return days[dayIndex];
}

// Función para renderizar el pronóstico
function renderWeatherForecast(forecastData) {
    const container = document.getElementById('weatherForecast');

    if (!forecastData || !forecastData.daily) {
        container.innerHTML = '<div class="weather-error">No se pudo cargar el pronóstico del tiempo.</div>';
        return;
    }

    const daily = forecastData.daily;
    const today = new Date();

    let html = '';

    // Open-Meteo devuelve arrays de datos diarios
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        // Open-Meteo devuelve fechas como strings ISO (YYYY-MM-DD)
        const dateStr = daily.time[i];
        const date = new Date(dateStr + 'T12:00:00'); // Agregar hora para evitar problemas de zona horaria
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const weatherCode = daily.weathercode[i];
        const dayName = getDayName(date, i);
        const icon = getWeatherIcon(weatherCode);
        const description = getWeatherDescription(weatherCode);

        // Obtener datos adicionales si están disponibles
        const precipitation = daily.precipitation_sum ? Math.round(daily.precipitation_sum[i] * 10) / 10 : 0;
        const precipitationProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;
        const windSpeed = daily.windspeed_10m_max ? Math.round(daily.windspeed_10m_max[i]) : 0;
        const windDirection = daily.winddirection_10m_dominant ? daily.winddirection_10m_dominant[i] : 0;

        html += `
                    <div class="weather-day">
                        <div class="weather-day-header">
                            <div class="weather-day-info">
                                <div class="weather-day-name">${dayName}</div>
                                <div class="weather-icon">${icon}</div>
                            </div>
                            <div class="weather-temp">
                                <span class="weather-temp-max">${maxTemp}°</span>
                                <span class="weather-temp-min">${minTemp}°</span>
                            </div>
                        </div>
                        <div class="weather-description">${description}</div>
                        <div class="weather-details">
                            <div class="weather-detail-item">
                                <span class="weather-detail-label">Precipitación</span>
                                <span class="weather-detail-value">${precipitationProb}%</span>
                            </div>
                            <div class="weather-detail-item">
                                <span class="weather-detail-label">Viento</span>
                                <span class="weather-detail-value">${windSpeed} km/h</span>
                            </div>
                            <div class="weather-detail-item">
                                <span class="weather-detail-label">Lluvia</span>
                                <span class="weather-detail-value">${precipitation} mm</span>
                            </div>
                        </div>
                    </div>
                `;
    }

    container.innerHTML = html;
}

// Función para cargar el pronóstico del tiempo
function loadWeatherForecast() {
    const CACHE_KEY = 'weather_forecast_cache';
    const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutos en milisegundos

    const container = document.getElementById('weatherForecast');

    // 1. Intentar cargar desde caché
    try {
        const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_EXPIRATION)) {
            console.log('Cargando pronóstico del tiempo desde caché.');
            renderWeatherForecast(cachedData.data);
            return; // Salir si el caché es válido
        }
    } catch (e) { /* Ignorar errores de caché */ }

    container.innerHTML = '<div class="weather-loading">Cargando pronóstico del tiempo...</div>';

    // Obtener ubicación del usuario
    if (navigator.geolocation) {
        console.log('Solicitando nueva geolocalización para el pronóstico.');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Llamar a la API de Open-Meteo (gratuita, sin API key)
                // Solicitar más datos: temperatura, código del clima, precipitación, viento
                const url = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant&timezone=auto&forecast_days=7`;

                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error al obtener datos del clima');
                        }
                        return response.json();
                    })
                    .then(data => {
                        // 2. Guardar en caché antes de renderizar
                        try {
                            const cachePayload = { timestamp: Date.now(), data: data };
                            localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
                        } catch (e) { /* Ignorar si no se puede guardar */ }

                        // 3. Renderizar los nuevos datos
                        renderWeatherForecast(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        container.innerHTML = '<div class="weather-error">Error al cargar el pronóstico del tiempo. Verifique su conexión.</div>';
                    });
            },
            (error) => {
                console.error('Error de geolocalización:', error);
                container.innerHTML = '<div class="weather-error">No se pudo obtener su ubicación. Por favor, permita el acceso a la ubicación.</div>';
            }
        );
    } else {
        container.innerHTML = '<div class="weather-error">Geolocalização não é suportada pelo seu navegador.</div>';
    }
}

// Funcionalidad de navegación inferior
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
        const labelElement = this.querySelector('.nav-label');
        if (!labelElement) return;
        const label = labelElement.textContent.trim();

        // Acción para el botón "Inicio"
        if (label === 'Inicio') {
            // Marcar el botón correcto como activo
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // Mostrar las pestañas principales
            document.querySelector('.tabs').style.display = '';
            // Activar la primera pestaña por defecto (Sucursales)
            document.querySelector('.tab[data-tab="branches"]').click();
        }

    });
});

const menuButton = document.querySelector('.menu-icon');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenuButton = document.getElementById('closeMenu');

function openMenu() {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('visible');
    sideMenu.removeAttribute('inert');
}

function closeMenu() {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('visible');
    sideMenu.setAttribute('inert', 'true');
}

menuButton.addEventListener('click', openMenu);
closeMenuButton.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sideMenu.classList.contains('open')) {
        closeMenu();
    }
});

// ── Dark Mode Toggle ──
(function initDarkMode() {
    const DARK_MODE_KEY = 'iasa_dark_mode';
    const toggle = document.getElementById('darkModeSwitch');
    if (!toggle) return;

    // Apply saved preference immediately
    const saved = localStorage.getItem(DARK_MODE_KEY);
    if (saved === 'true') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }

    toggle.addEventListener('change', function () {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem(DARK_MODE_KEY, 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem(DARK_MODE_KEY, 'false');
        }
    });
})();

// Service Worker registration and update handling: notifica al usuario cuando hay nueva versión
if ('serviceWorker' in navigator) {
    (function registerSW() {
        const SW_VERSION = '20260218a'; // actualizar en cada deploy (cache-bust)
        const AUTO_UPDATE = true; // si true enviará SKIP_WAITING automáticamente y recargará
        const swUrl = '/sw.js?v=' + SW_VERSION;

        navigator.serviceWorker.register(swUrl).then(registration => {
            // fuerza búsqueda de nueva versión al volver al primer plano
            document.addEventListener('visibilitychange', () => { try { registration.update(); } catch (e) { } });
            window.addEventListener('focus', () => { try { registration.update(); } catch (e) { } });

            function showUpdateBanner(reg) {
                try {
                    if (!reg || !reg.waiting) return;
                    // Si el flag AUTO_UPDATE está activo, pedimos al service worker que active inmediatamente
                    if (AUTO_UPDATE) {
                        try {
                            // Evitar múltiples recargas
                            if (!window.__sw_refreshing) {
                                console.log('[SW] AUTO_UPDATE: solicitando skipWaiting');
                                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                                window.__sw_refreshing = true;
                                navigator.serviceWorker.addEventListener('controllerchange', () => {
                                    if (window.__sw_reloaded) return;
                                    window.__sw_reloaded = true;
                                    console.log('[SW] controllerchange detectado, recargando página');
                                    window.location.reload();
                                });
                            }
                        } catch (e) { console.warn('AUTO_UPDATE error', e); }
                        return; // no mostrar banner si aplicamos auto-update
                    }
                    // Crear banner si no existe
                    if (!document.getElementById('swUpdateBanner')) {
                        const banner = document.createElement('div');
                        banner.id = 'swUpdateBanner';
                        banner.className = 'sw-update-banner';
                        banner.innerHTML = `
                            <div class="sw-update-content">
                                <div class="sw-update-text">Nueva versión disponible</div>
                                <div class="sw-update-actions">
                                    <button id="swReloadBtn" class="btn primary">Recargar</button>
                                    <button id="swLaterBtn" class="btn">Más tarde</button>
                                </div>
                            </div>`;
                        document.body.appendChild(banner);

                        document.getElementById('swReloadBtn').addEventListener('click', () => {
                            try { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch (e) { console.warn(e); }
                            // cuando el nuevo worker active, recargar
                            reg.waiting.addEventListener('statechange', (e) => {
                                if (e.target.state === 'activated') window.location.reload();
                            });
                        });
                        document.getElementById('swLaterBtn').addEventListener('click', () => {
                            const b = document.getElementById('swUpdateBanner'); if (b) b.remove();
                        });
                    }
                } catch (e) { console.warn('showUpdateBanner error', e); }
            }

            // Si hay un worker esperando al cargar, mostrar banner
            if (registration.waiting) showUpdateBanner(registration);

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateBanner(registration);
                    }
                });
            });
        }).catch(err => console.warn('SW registration failed:', err));
    })();
}

/* ----------------------------- */
/* Integración Apitube (Noticias) */
/* ----------------------------- */

let LATEST_NEWS_ITEMS = [];

function buildNewsHTML(items) {
    return items.map(item => {
        const title = item.title || item.headline || item.name || 'Sin título';
        const summary = item.description || item.summary || item.excerpt || '';
        const image = item.image || item.image_url || item.thumbnail || '';
        const video = item.video || item.videoUrl || item.video_url || '';
        const url = item.url || item.link || '#';

        // Determinar si mostrar video o imagen
        let mediaHTML = '';
        if (video) {
            // Obtener thumbnail para el video (pequeño como las imágenes)
            const youtubeId = extractYouTubeId(video);
            let thumbSrc = '';
            if (youtubeId) {
                // YouTube: usar thumbnail de YouTube
                thumbSrc = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
            } else {
                // Video directo: usar el video como poster (carga solo metadata)
                // Nota: #t=0.5 es solo para el thumbnail, no para la carga del video
                thumbSrc = `${video}#t=0.5`;
            }
            mediaHTML = `<div class="news-video-thumb" data-video="${video}">
                ${youtubeId
                    ? `<img loading="lazy" src="${thumbSrc}" alt="" class="news-image">`
                    : `<video class="news-image" preload="none" muted data-video-src="${video}"></video>`
                }
                <div class="video-play-icon">▶</div>
            </div>`;
        } else {
            mediaHTML = `<img loading="lazy" onerror="this.remove()" src="${image || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'90\' height=\'90\'%3E%3Crect fill=\'%23eaeaea\' width=\'90\' height=\'90\'/%3E%3C/svg%3E'}" alt="" class="news-image">`;
        }

        return `
                <div class="news-item" data-video="${video}">
                    ${mediaHTML}
                    <div class="news-content">
                        <a href="${url}" class="news-title" style="text-decoration:none;color:inherit;display:block" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>
                        <div class="activity-description">${escapeHtml(summary)}</div>
                    </div>
                </div>`;
    }).join('');
}

// Función auxiliar para extraer ID de YouTube
function extractYouTubeId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
        /^([a-zA-Z0-9_-]{11})$/  // ID directo
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}
function renderNewsItems(items) {
    const list = document.querySelector('.news-list');
    if (!items || items.length === 0) {
        list.innerHTML = '<p>No hay noticias disponibles.</p>';
        return;
    }
    list.innerHTML = buildNewsHTML(items.slice(0, 5)); // Mostrar solo las primeras 5 en la vista principal
    LATEST_NEWS_ITEMS = items.slice();
    // Inicializar lazy load inmediatamente después de renderizar
    setTimeout(() => initVideosLazyLoad(list), 50);
}

// Helper para escapar texto
function escapeHtml(str) { return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Cargar noticias inicialmente y cuando se active la pestaña Noticias
// Llamada inicial para poblar la sección al cargar la página
(function initNews() {
    // La lógica de carga ahora está centralizada en onAuthStateChanged -> loadAndListenForNews
})();

// Navegación desde el menú lateral hacia las secciones
document.querySelectorAll('.side-menu__item').forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault();

        // Si el item tiene un enlace, manejar navegación externa e interna y cerrar menú
        try {
            const href = item.getAttribute('href') || item.href || '';
            // Enlaces externos (http/https)
            if (href && href.startsWith('http')) {
                window.open(href, '_blank', 'noopener');
                closeMenu();
                return;
            }

            // Enlaces internos: navegar respetando target (ej. target="_blank")
            if (href && (href.startsWith('/') || href.endsWith('.html') || href.startsWith('./') || href.startsWith('../'))) {
                closeMenu();
                try {
                    const target = item.getAttribute('target');
                    if (target === '_blank') {
                        const newWin = window.open(href, '_blank', 'noopener');
                        if (!newWin) window.location.href = href;
                    } else {
                        window.location.href = href;
                    }
                } catch (e) {
                    window.location.href = href;
                }
                return;
            }
        } catch (e) { /* ignore */ }

        const text = item.textContent.trim();

        // Navegar a página de QR Productos Premiados
        if (text === 'QR Productos Premiados') {
            closeMenu();
            window.location.href = '/qr';
            return;
        }

        // Navegar al Cuaderno de actividades (otra página)
        if (text === 'Cuaderno de actividades') {
            closeMenu();
            window.location.href = '/activities';
            return;
        }

        // Navegar a la página de Contacto
        if (text === 'Contacto') {
            closeMenu();
            window.location.href = '/contacto';
            return;
        }

        // Navegar a la página de Agendar visita
        if (text === 'Agendar visita') {
            closeMenu();
            window.location.href = '/visitas';
            return;
        }
        if (text === 'Mis noticias') {
            closeMenu();
            window.location.href = 'misnoticias.html';
            return;
        }

        // Pestaña Sucursales
        if (text === 'Sucursales') {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            const branchesTab = document.querySelector('.tab[data-tab="branches"]');
            if (branchesTab) branchesTab.classList.add('active');

            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            const branchesSection = document.getElementById('branchesSection');
            if (branchesSection) branchesSection.classList.add('active');
        }

        // Pestaña Noticias
        if (text === 'Noticias') {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            const newsTab = document.querySelector('.tab[data-tab="news"]');
            if (newsTab) newsTab.classList.add('active');

            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            const newsSection = document.getElementById('newsSection');
            if (newsSection) newsSection.classList.add('active');

            if (typeof loadNewsFromApi === 'function') {
                loadNewsFromApi();
            }
        }

        // Pestaña Tiempo
        if (text === 'Tiempo') {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            const weatherTab = document.querySelector('.tab[data-tab="weather"]');
            if (weatherTab) weatherTab.classList.add('active');

            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            const weatherSection = document.getElementById('weatherSection');
            if (weatherSection) weatherSection.classList.add('active');

            if (typeof loadWeatherForecast === 'function') {
                loadWeatherForecast();
            }

            // Desplazar suavemente hacia la sección de tiempo
            weatherSection?.scrollIntoView({ behavior: 'smooth' });
        }

        // Sección Mercado
        if (text === 'Mercado') {
            closeMenu();
            window.location.href = '/mercado';
            return;
        }

        // Navegar a Comunidad (menú lateral)
        if (text === 'Comunidad') {
            closeMenu();
            window.location.href = '/comunidad';
            return;
        }

        // Navegar a Soporte
        if (text === 'Soporte') {
            closeMenu();
            window.location.href = '/soporte';
            return;
        }

        // Navegar a Sucursales
        if (text === 'Sucursales') {
            closeMenu();
            window.location.href = '/homenoticias';
            return;
        }

        // Navegar a Novedades
        if (text === 'Novedades') {
            closeMenu();
            window.location.href = '/homenoticias';
            return;
        }

        // Cerrar menú después de la navegación
        closeMenu();
    });
});

const viewAllNewsLink = document.getElementById('viewAllNewsLink');
const newsOverlay = document.getElementById('newsOverlay');
const newsModalList = document.getElementById('newsModalList');
const closeNews = document.getElementById('closeNews');
const imageOverlay = document.getElementById('imageOverlay');
const imageOverlayImg = document.getElementById('imageOverlayImg');
const newsListEl = document.getElementById('newsList');
const itemOverlay = document.getElementById('itemOverlay');
const itemOverlayTitle = document.getElementById('itemOverlayTitle');
const itemOverlayBody = document.getElementById('itemOverlayBody');
const itemOverlayOpenLink = document.getElementById('itemOverlayOpenLink');
const closeItem = document.getElementById('closeItem');
function openNewsModal() {
    if (!newsOverlay || !newsModalList) return;
    const items = Array.isArray(LATEST_NEWS_ITEMS) ? LATEST_NEWS_ITEMS : [];
    if (items.length === 0) return;
    newsModalList.innerHTML = buildNewsHTML(items);
    // Ajuste para el modal: mostrar todas las noticias, no solo 5
    newsModalList.innerHTML = buildNewsHTML(items);
    newsOverlay.classList.add('open');
    // Inicializar lazy load para videos en el modal
    setTimeout(() => initVideosLazyLoad(newsModalList), 50);
}
function openImageModal(src) {
    if (!imageOverlay || !imageOverlayImg) return;
    imageOverlayImg.src = src;
    imageOverlay.classList.add('open');
}

// Función para abrir modal de video
function openVideoModal(videoUrl) {
    const videoOverlay = document.getElementById('videoOverlay');
    const videoPlayer = document.getElementById('videoPlayer');
    const youtubePlayer = document.getElementById('youtubePlayer');
    if (!videoOverlay) return;

    const youtubeId = extractYouTubeId(videoUrl);

    if (youtubeId) {
        // Es video de YouTube
        youtubePlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
        youtubePlayer.style.display = 'block';
        videoPlayer.style.display = 'none';
    } else {
        // Es video directo
        videoPlayer.src = videoUrl;
        videoPlayer.style.display = 'block';
        youtubePlayer.style.display = 'none';
        videoPlayer.play();
    }

    videoOverlay.classList.add('open');
}

function closeVideoModal() {
    const videoOverlay = document.getElementById('videoOverlay');
    const videoPlayer = document.getElementById('videoPlayer');
    const youtubePlayer = document.getElementById('youtubePlayer');
    if (!videoOverlay) return;

    videoPlayer.pause();
    videoPlayer.src = '';
    youtubePlayer.src = '';
    videoOverlay.classList.remove('open');
}

if (viewAllNewsLink) {
    viewAllNewsLink.addEventListener('click', e => { e.preventDefault(); openNewsModal(); });
}
if (newsOverlay) {
    newsOverlay.addEventListener('click', e => { if (e.target === newsOverlay) newsOverlay.classList.remove('open'); });
}
if (closeNews) {
    closeNews.addEventListener('click', () => newsOverlay.classList.remove('open'));
}
function handleNewsItemClick(e) {
    const item = e.target.closest('.news-item');
    if (!item) return;

    // Verificar si es un video
    const videoThumb = e.target.closest('.news-video-thumb');
    const videoUrl = item.dataset.video;

    if (videoThumb && videoUrl) {
        e.preventDefault();
        openVideoModal(videoUrl);
        return;
    }

    const img = item.querySelector('.news-image');
    const titleEl = item.querySelector('.news-title');
    const descEl = item.querySelector('.activity-description');
    const linkHref = titleEl && titleEl.getAttribute('href') ? titleEl.getAttribute('href') : '#';

    // Si hace click en imagen (no video)
    if (e.target.closest('.news-image') && !videoUrl) {
        e.preventDefault();
        openImageModal(img && img.src ? img.src : '');
        return;
    }
    if (e.target.closest('.news-title')) {
        e.preventDefault();
    }

    // Contenido del modal
    let mediaContent = '';
    if (videoUrl) {
        const youtubeId = extractYouTubeId(videoUrl);
        if (youtubeId) {
            mediaContent = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin-bottom:12px;">
                <iframe src="https://www.youtube.com/embed/${youtubeId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:8px;" allowfullscreen></iframe>
            </div>`;
        } else {
            mediaContent = `<video controls playsinline style="width:100%;border-radius:8px;margin-bottom:12px;"><source src="${videoUrl}" type="video/mp4"></video>`;
        }
    } else if (img && img.src) {
        mediaContent = `<img src="${img.src}" alt="" style="width:100%;border-radius:8px;margin-bottom:12px">`;
    }

    itemOverlayTitle.textContent = titleEl ? titleEl.textContent : '';
    itemOverlayBody.innerHTML = `${mediaContent}${descEl ? descEl.textContent : ''}`;
    if (linkHref && linkHref !== '#') {
        itemOverlayOpenLink.style.display = '';
        itemOverlayOpenLink.onclick = () => { window.open(linkHref, '_blank', 'noopener'); };
    } else {
        itemOverlayOpenLink.style.display = 'none';
        itemOverlayOpenLink.onclick = null;
    }
    itemOverlay.classList.add('open');
}

if (newsListEl) {
    newsListEl.addEventListener('click', handleNewsItemClick);
}
if (newsModalList) {
    newsModalList.addEventListener('click', handleNewsItemClick);
}

// Lazy load videos: solo cargar cuando sean visibles o al hacer click
function initVideosLazyLoad(container = document) {
    const videos = container.querySelectorAll('video[preload="none"]');
    console.log('[LazyLoad] Inicializando lazy load. Videos encontrados:', videos.length);
    if (videos.length === 0) return;

    // Usar Intersection Observer para detectar videos visibles
    const observerOptions = { root: null, rootMargin: '100px', threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                if (!video.querySelector('source')) {
                    const videoSrc = video.dataset.videoSrc;
                    console.log('[LazyLoad] Video visible, cargando:', videoSrc);
                    if (videoSrc) {
                        const source = document.createElement('source');
                        source.src = videoSrc;
                        source.type = 'video/mp4';
                        video.appendChild(source);
                        video.load();
                    }
                    observer.unobserve(video);
                }
            }
        });
    }, observerOptions);

    videos.forEach(video => observer.observe(video));

    // También cargar video si hace click en el play button
    container.querySelectorAll('.news-video-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            const video = thumb.querySelector('video');
            if (video && !video.querySelector('source')) {
                const videoSrc = video.dataset.videoSrc;
                console.log('[LazyLoad] Click en video, cargando:', videoSrc);
                if (videoSrc) {
                    const source = document.createElement('source');
                    source.src = videoSrc;
                    source.type = 'video/mp4';
                    video.appendChild(source);
                    video.load();
                }
            }
        });
    });
}

if (imageOverlay) {
    imageOverlay.addEventListener('click', e => { if (e.target === imageOverlay) imageOverlay.classList.remove('open'); });
}
if (itemOverlay) {
    itemOverlay.addEventListener('click', e => { if (e.target === itemOverlay) itemOverlay.classList.remove('open'); });
}
if (closeItem) {
    closeItem.addEventListener('click', () => itemOverlay.classList.remove('open'));
}

// Video overlay events
const videoOverlay = document.getElementById('videoOverlay');
if (videoOverlay) {
    videoOverlay.addEventListener('click', e => {
        if (e.target === videoOverlay) closeVideoModal();
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && imageOverlay && imageOverlay.classList.contains('open')) {
        imageOverlay.classList.remove('open');
    }
    if (event.key === 'Escape' && itemOverlay && itemOverlay.classList.contains('open')) {
        itemOverlay.classList.remove('open');
    }
    if (event.key === 'Escape' && videoOverlay && videoOverlay.classList.contains('open')) {
        closeVideoModal();
    }
});

