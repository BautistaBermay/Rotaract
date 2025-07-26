// --- INICIALIZACIÓN DE FIREBASE (Con tu código) ---
const firebaseConfig = {
  apiKey: "AIzaSyA-PUWeewc2GDLkIbkJFtTHI7qj1YnKt6g",
  authDomain: "rotaract-bahia-blanca.firebaseapp.com",
  projectId: "rotaract-bahia-blanca",
  storageBucket: "rotaract-bahia-blanca.appspot.com",
  messagingSenderId: "341656264257",
  appId: "1:341656264257:web:b4f344b6024b84341730c0",
  measurementId: "G-VXKKFV30H8"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- LÓGICA GENERAL DEL SITIO ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Efecto de Header
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10));
    }

    // 2. Animación de Entrada
    const sections = document.querySelectorAll('.fade-in-section');
    if (sections.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        sections.forEach(section => observer.observe(section));
    }

    // 3. Pestañas en sumate.html
    const loginFormElement = document.getElementById('login-form');
    if (loginFormElement) { /* ...código de pestañas... */ }

    // 4. Carga de Contenido Dinámico
    if (document.getElementById('news-container')) {
        cargarContenido('noticias', 'news-container'); // Página de Noticias
    }
    if (document.getElementById('latest-news-container')) {
        cargarContenido('noticias', 'latest-news-container', 3); // INICIO - ¡ESTA ES LA LÍNEA NUEVA!
    }
    if (document.getElementById('project-container')) {
        cargarContenido('proyectos', 'project-container'); // Página de Proyectos
    }
    if (document.getElementById('actas-container')) {
        cargarContenido('actas', 'actas-container'); // Página de Actas
    }

    // 5. Proteger Páginas de Socios
    if (window.location.pathname.includes('area-socio.html') || window.location.pathname.includes('actas.html')) {
        protegerPaginasDeSocios();
    }

    // 6. Botón de Cerrar Sesión
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) { /* ...código de logout... */ }
});


// --- LÓGICA DEL PORTAL DE SOCIOS ---
// (Aquí va todo el código de registro y login que ya teníamos)


// --- FUNCIONES AUXILIARES ---

function protegerPaginasDeSocios() { /* ...código que ya teníamos... */ }

async function cargarContenido(tipo, containerId, limite = 0) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const GITHUB_USER = 'BautistaBermay';
    const GITHUB_REPO = 'Rotaract';
    const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/_posts/${tipo}`;

    try {
        const response = await axios.get(API_URL);
        let posts = response.data.filter(item => item.name.endsWith('.md'));
        posts.sort((a, b) => b.name.localeCompare(a.name)); // Ordenar del más nuevo al más viejo

        if (limite > 0) {
            posts = posts.slice(0, limite); // Aplicar el límite si existe
        }
        
        if (posts.length === 0) {
            container.innerHTML = `<p>Aún no hay ${tipo} publicados.</p>`;
            return;
        }

        container.innerHTML = '';

        const promises = posts.map(post => axios.get(post.download_url).then(res => parseFrontmatter(res.data)));
        const allItems = await Promise.all(promises);

        if (tipo === 'actas') {
            renderActas(allItems, container);
        } else {
            renderCards(allItems, tipo, container);
        }

    } catch (error) {
        console.error(`Error al cargar ${tipo}:`, error);
        container.innerHTML = `<p>Hubo un error al cargar el contenido.</p>`;
    }
}

function renderCards(items, tipo, container) {
    // (código que ya tenías para dibujar las tarjetas)
}

function renderActas(items, container) {
    // (código que ya tenías para dibujar la tabla de actas)
}

function parseFrontmatter(markdownContent) {
    // (código que ya tenías para parsear)
    return {}; // Placeholder for brevity, but use the full function
}

// Pega el resto de las funciones que faltan aquí (login, registro, etc.)