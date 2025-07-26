// El objeto 'firebase' es cargado por los scripts en cada archivo HTML.
// Este script asume que 'firebase' ya existe.
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
                .then(userCredential => db.collection('socios').doc(userCredential.user.uid).set({
                    nombre: name,
                    email: email,
                    estadoCuota: 'Pendiente',
                    vencimiento: 'N/A'
                }))
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
                    const nombreSocioEl = document.getElementById('nombre-socio');
                    const estadoCuotaEl = document.getElementById('estado-cuota');
                    const vencimientoCuotaEl = document.getElementById('vencimiento-cuota');
                    if(nombreSocioEl) nombreSocioEl.textContent = data.nombre;
                    if(estadoCuotaEl) estadoCuotaEl.textContent = data.estadoCuota;
                    if(vencimientoCuotaEl) vencimientoCuotaEl.textContent = data.vencimiento;
                }
            });
        } else {
            // Retrasar la redirección para que el usuario pueda ver un mensaje si lo hubiera
            setTimeout(() => {
                window.location.href = 'sumate.html';
            }, 500);
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
        if (!response.data || response.data.length === 0) {
            console.log(`No hay ${tipo} en el CMS, se dejará el contenido de ejemplo.`);
            return;
        }
        
        const posts = response.data.filter(item => item.name.endsWith('.md'));

        if (posts.length === 0) {
            return; 
        }

        container.innerHTML = ''; // Limpiar contenido de ejemplo
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
        card.dataset.category = item.category?.toLowerCase().replace(/\s+/g, '-') || '';
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
        button.dataset.filter = category.toLowerCase().replace(/\s+/g, '-');
        if (category === 'Todos') button.classList.add('active');
        
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.card-grid .card').forEach(card => {
                if (category === 'Todos' || card.dataset.category === button.dataset.filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
        filterContainer.appendChild(button);
    });
}

function parseFrontmatter(text) {
    const frontmatter = {};
    const match = text.match(/---\s*([\s\S]*?)\s*---/);
    if (match) {
        const yaml = match[1];
        yaml.split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim().replace(/"/g, '').replace(/'/g, '');
                frontmatter[key] = value;
            }
        });
    }
    return frontmatter;
}