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

// --- LÓGICA PRINCIPAL ---
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

    // 3. Pestañas en sumate.html
    setupTabs();
    
    // 4. Formularios de Login/Registro
    setupAuthForms();

    // 5. Cargar contenido del CMS (Noticias y Proyectos)
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
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;

            if (password !== passwordConfirm) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    return db.collection('socios').doc(userCredential.user.uid).set({
                        nombre: name,
                        email: email,
                        estadoCuota: 'Pendiente',
                        vencimiento: 'N/A'
                    });
                })
                .then(() => {
                    alert('¡Registro exitoso! Serás dirigido a tu panel.');
                    window.location.href = 'area-socio.html';
                })
                .catch(error => alert('Error al registrar: ' + error.message));
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    window.location.href = 'area-socio.html';
                })
                .catch(error => alert('Error al iniciar sesión: ' + error.message));
        });
    }
}

function protegerAreaSocio() {
    auth.onAuthStateChanged(user => {
        if (user) {
            const docRef = db.collection('socios').doc(user.uid);
            docRef.get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('nombre-socio').textContent = data.nombre;
                    document.getElementById('estado-cuota').textContent = data.estadoCuota;
                    document.getElementById('vencimiento-cuota').textContent = data.vencimiento;
                }
            });
        } else {
            window.location.href = 'sumate.html';
        }
    });
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
            // No hacer nada, dejar el contenido de ejemplo
            return;
        }

        container.innerHTML = ''; // Limpiar contenido de ejemplo SOLO si hay contenido del CMS
        posts.sort((a, b) => b.name.localeCompare(a.name));

        const fetchPromises = posts.map(post => axios.get(post.download_url).then(res => parseFrontmatter(res.data)));
        const allItems = await Promise.all(fetchPromises);

        renderItems(allItems, tipo, container);
        if (tipo === 'proyectos') {
            renderProjectFilters(allItems);
        }

    } catch (error) {
        console.error(`Error al cargar ${tipo}:`, error);
        // No hacer nada si falla, el contenido de ejemplo se quedará visible
    }
}

function renderItems(items, tipo, container) {
    items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'card';
        card.dataset.category = item.category?.toLowerCase() || '';
        const title = item.title || 'Sin Título';
        const image = item.image || 'https://placehold.co/600x400';
        const summary = item.summary || '';
        const date = new Date(item.date).toLocaleDateString('es-AR', { timeZone: 'UTC' });
        const meta = tipo === 'noticias' ? `Publicado el ${date}` : `Categoría: ${item.category}`;
        
        card.innerHTML = `
            <img src="${image}" alt="${title}">
            <div class="card-content">
                <h3>${title}</h3>
                <p class="card-meta">${meta}</p>
                <p>${summary}</p>
                <a href="noticia-ejemplo.html">Leer más &rarr;</a> 
            </div>
        `;
        container.appendChild(card);
    });
}

function renderProjectFilters(projects) {
    const filterContainer = document.getElementById('project-filters');
    if (!filterContainer) return;
    const categories = ['Todos', ...new Set(projects.map(p => p.category).filter(Boolean))];
    
    filterContainer.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = category;
        button.dataset.filter = category.toLowerCase();
        if (category === 'Todos') button.classList.add('active');
        
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.card-grid .card').forEach(card => {
                if (category === 'Todos' || card.dataset.category === category.toLowerCase()) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
        filterContainer.appendChild(button);
    });
}

function parseFrontmatter(markdownContent) {
    const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
    const match = frontmatterRegex.exec(markdownContent);
    const frontmatter = {};
    if (match) {
        const yaml = match[1];
        yaml.split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim().replace(/"/g, '');
                frontmatter[key] = value;
            }
        });
    }
    return frontmatter;
}