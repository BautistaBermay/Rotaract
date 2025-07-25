// --- INICIALIZACIÓN DE FIREBASE ---
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


// --- LÓGICA PRINCIPAL (Se ejecuta cuando toda la página ha cargado) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica del Header
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 10);
        });
    }

    // 2. Animaciones de Entrada
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

    // 3. Lógica para Pestañas en sumate.html
    setupTabs();
    
    // 4. Lógica Formularios de Login/Registro
    setupAuthForms();

    // 5. Cargar contenido del CMS
    if (document.getElementById('news-container')) {
        cargarContenido('noticias');
    }
    if (document.getElementById('project-container')) {
        cargarContenido('proyectos');
    }

    // 6. Proteger el Área de Socio y Botón de Logout
    if (window.location.pathname.includes('area-socio.html')) {
        protegerAreaSocio();
    }
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    }
});


// --- DEFINICIÓN DE FUNCIONES ---

function setupTabs() {
    const loginFormElement = document.getElementById('login-form');
    if (!loginFormElement) return;

    const registerFormElement = document.getElementById('register-form');
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const isLogin = button.textContent.includes('Iniciar Sesión');
            loginFormElement.classList.toggle('active', isLogin);
            registerFormElement.classList.toggle('active', !isLogin);
        });
    });
}

function setupAuthForms() {
    // Manejar el registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // ... (código de registro que ya tienes)
        });
    }

    // Manejar el inicio de sesión
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // ... (código de login que ya tienes)
        });
    }
}


function protegerAreaSocio() {
    // ... (código que ya tienes)
}

async function cargarContenido(tipo) {
    const container = document.getElementById(tipo === 'noticias' ? 'news-container' : 'project-container');
    if (!container) return;

    const GITHUB_USER = 'BautistaBermay';
    const GITHUB_REPO = 'Rotaract';
    const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/_posts/${tipo}`;

    try {
        const response = await axios.get(API_URL);
        const posts = response.data.filter(item => item.name.endsWith('.md'));

        if (posts.length === 0) {
            container.innerHTML = `<p>Aún no hay ${tipo} para mostrar. ¡Crea el primero desde el panel de administración!</p>`;
            return;
        }

        container.innerHTML = '';
        posts.sort((a, b) => b.name.localeCompare(a.name));

        const fetchPromises = posts.map(post => axios.get(post.download_url).then(res => parseFrontmatter(res.data)));
        const allItems = await Promise.all(fetchPromises);

        renderItems(allItems, tipo, container);
        if (tipo === 'proyectos') {
            renderProjectFilters(allItems);
        }

    } catch (error) {
        console.error(`Error al cargar ${tipo}:`, error);
        container.innerHTML = `<p style="color: red; font-weight: bold;">Error al cargar el contenido. Es posible que el repositorio de GitHub sea privado. Asegúrate de que sea público.</p>`;
    }
}

function renderItems(items, tipo, container) {
    // ... (código que ya tienes)
}

function renderProjectFilters(projects) {
    // ... (código que ya tienes)
}

function parseFrontmatter(markdownContent) {
    // ... (código que ya tienes)
}

// Pega aquí el resto de las funciones que faltan:
// - La función de registro completa
// - La función de login completa
// - La función protegerAreaSocio completa
// - Las funciones renderItems, renderProjectFilters y parseFrontmatter completas
// (Las he omitido arriba por brevedad, pero en tu archivo deben estar todas las que te di en la respuesta anterior)