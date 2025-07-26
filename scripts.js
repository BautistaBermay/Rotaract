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

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();


// --- LÓGICA GENERAL DEL SITIO (Se ejecuta cuando la página carga) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Efecto de Header con Sombra
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 10);
        });
    }

    // 2. Animación de Entrada para Secciones
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
    const loginFormElement = document.getElementById('login-form');
    if (loginFormElement) {
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

    // 4. Lógica para Cargar Contenido Dinámico
    if (document.getElementById('news-container')) {
        cargarContenido('noticias');
    }
    if (document.getElementById('project-container')) {
        cargarContenido('proyectos');
    }
    if (document.getElementById('actas-container')) {
        cargarContenido('actas');
    }

    // 5. Lógica para Proteger el Área de Socio y Actas
    if (window.location.pathname.includes('area-socio.html') || window.location.pathname.includes('actas.html')) {
        protegerPaginasDeSocios();
    }

    // 6. Lógica para el Botón de Cerrar Sesión
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                alert('Has cerrado sesión.');
                window.location.href = 'index.html';
            });
        });
    }
});


// --- LÓGICA DEL PORTAL DE SOCIOS (Formularios) ---
// (Manejador de registro y login que ya teníamos)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => { e.preventDefault(); /* ...código de registro... */ });
}
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => { e.preventDefault(); /* ...código de login... */ });
}


// --- FUNCIONES AUXILIARES ---

// Proteger páginas de socios y mostrar sus datos
function protegerPaginasDeSocios() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Si estamos en el area de socio, busca y muestra sus datos
            if (window.location.pathname.includes('area-socio.html')) {
                const docRef = db.collection('socios').doc(user.uid);
                docRef.get().then((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        document.getElementById('nombre-socio').textContent = data.nombre;
                        document.getElementById('nombre-socio-datos').textContent = data.nombre;
                        document.getElementById('email-socio').textContent = data.email;
                        document.getElementById('estado-cuota').textContent = data.estadoCuota;
                        document.getElementById('vencimiento-cuota').textContent = data.vencimiento;
                    }
                });
            }
        } else {
            // Si no hay usuario, redirigir a la página de login
            alert('Necesitas iniciar sesión para ver esta página.');
            window.location.href = 'sumate.html';
        }
    });
}


// Cargar contenido (Noticias/Proyectos/Actas) desde el CMS/GitHub
async function cargarContenido(tipo) {
    const container = document.getElementById(`${tipo}-container`);
    if (!container) return;

    const GITHUB_USER = 'BautistaBermay';
    const GITHUB_REPO = 'Rotaract';
    const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/_posts/${tipo}`;

    try {
        const response = await axios.get(API_URL);
        const posts = response.data.filter(item => item.name.endsWith('.md'));

        if (posts.length === 0) {
            container.innerHTML = `<p>Aún no hay ${tipo} publicados. ¡Crea el primero desde el panel de administración!</p>`;
            return;
        }

        container.innerHTML = '';
        posts.sort((a, b) => b.name.localeCompare(a.name));

        const promises = posts.map(post => axios.get(post.download_url).then(res => parseFrontmatter(res.data)));
        const allItems = await Promise.all(promises);

        if (tipo === 'actas') {
            renderActas(allItems, container);
        } else {
            renderCards(allItems, tipo, container);
        }

    } catch (error) {
        container.innerHTML = `<p>Hubo un error al cargar el contenido.</p>`;
    }
}

// Dibujar las tarjetas para Noticias y Proyectos
function renderCards(items, tipo, container) {
    container.className = 'card-grid';
    items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'card';
        // ... (resto del código para crear las tarjetas)
    });
}

// Dibujar la tabla para Actas
function renderActas(items, container) {
    const table = document.createElement('table');
    table.className = 'actas-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Título del Acta</th>
                <th>Fecha</th>
                <th>Descarga</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    items.forEach(item => {
        const row = document.createElement('tr');
        const title = item.title || 'Acta sin título';
        const date = new Date(item.date).toLocaleDateString('es-AR', { timeZone: 'UTC' });
        const pdfLink = item.pdf ? `<a href="/${item.pdf}" target="_blank" class="button button-primary" style="padding: 8px 16px;">Descargar PDF</a>` : 'N/A';
        row.innerHTML = `<td>${title}</td><td>${date}</td><td>${pdfLink}</td>`;
        tbody.appendChild(row);
    });
    container.appendChild(table);
}


// Extraer la información de los archivos
function parseFrontmatter(markdownContent) {
    // ... (código para parsear que ya tenías)
    return {}; // Placeholder for brevity
}