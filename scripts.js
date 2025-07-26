document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN ---
    // ¡IMPORTANTE! El usuario debe completar estas variables.
    const firebaseConfig = {
        apiKey: "TU_API_KEY",
        authDomain: "TU_AUTH_DOMAIN",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_STORAGE_BUCKET",
        messagingSenderId: "TU_MESSAGING_SENDER_ID",
        appId: "TU_APP_ID"
    };

    // Configuración para cargar contenido desde GitHub
    const GITHUB_USER = 'TU_USUARIO_DE_GITHUB';
    const GITHUB_REPO = 'TU_REPOSITORIO';
    const GITHUB_BRANCH = 'main'; // o 'master'


    // --- INICIALIZACIÓN DE FIREBASE ---
    // Solo inicializar si no ha sido inicializado antes
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- LÓGICA GENERAL DEL FRONTEND ---
    
    // Menú hamburguesa para móviles
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Animación de fade-in al hacer scroll
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // --- CARGA DE CONTENIDO DINÁMICO DESDE GITHUB ---

    // Función para parsear el Front Matter de los archivos Markdown
    function parseFrontMatter(text) {
        const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;
        const match = frontMatterRegex.exec(text);
        const frontMatter = {};
        if (match) {
            const yaml = match[1];
            yaml.split('\n').forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    frontMatter[key] = value.replace(/"/g, ''); // Limpiar comillas
                }
            });
        }
        return frontMatter;
    }

    // Función para cargar contenido (noticias o proyectos)
    async function loadContent(type, containerId, limit = 0) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/_posts/${type}?ref=${GITHUB_BRANCH}`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Error al cargar ${type} desde GitHub`);
            
            let items = await response.json();
            // Ordenar por fecha (nombre de archivo) descendente
            items.sort((a, b) => b.name.localeCompare(a.name));

            if (limit > 0) {
                items = items.slice(0, limit);
            }

            let contentHTML = '';
            for (const item of items) {
                const fileResponse = await fetch(item.download_url);
                const fileContent = await fileResponse.text();
                const data = parseFrontMatter(fileContent);

                if (type === 'noticias') {
                    contentHTML += `
                        <div class="card fade-in">
                            <img src="${data.image}" alt="${data.title}">
                            <div class="card-content">
                                <h3>${data.title}</h3>
                                <p>${data.summary}</p>
                                <a href="noticia-ejemplo.html?post=${item.name}" class="card-link">Leer más</a>
                            </div>
                        </div>`;
                } else if (type === 'proyectos') {
                     contentHTML += `
                        <div class="card project-card fade-in" data-category="${data.category.toLowerCase().replace(' ', '-')}">
                            <div class="card-category">${data.category}</div>
                            <img src="${data.image}" alt="${data.title}">
                            <div class="card-content">
                                <h3>${data.title}</h3>
                                <p>${data.summary}</p>
                            </div>
                        </div>`;
                }
            }

            if (contentHTML) {
                container.innerHTML = contentHTML;
                // Re-observar los nuevos elementos para la animación
                container.querySelectorAll('.fade-in').forEach(el => appearOnScroll.observe(el));
            }

        } catch (error) {
            console.error(error);
            // Si falla la carga, el contenido estático del HTML permanece visible.
        }
    }

    // Cargar contenido en las páginas correspondientes
    if (document.getElementById('latest-news-container')) {
        loadContent('noticias', 'latest-news-container', 3);
    }
    if (document.getElementById('news-container')) {
        loadContent('noticias', 'news-container');
    }
    if (document.getElementById('projects-container')) {
        loadContent('proyectos', 'projects-container');
    }

    // --- LÓGICA DE AUTENTICACIÓN (FIREBASE) ---

    // Pestañas en la página "sumate.html"
    window.openTab = (evt, tabName) => {
        const tabcontent = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        const tablinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }

    // Formulario de Registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const errorEl = document.getElementById('register-error');
            
            if (password !== confirmPassword) {
                errorEl.textContent = 'Las contraseñas no coinciden.';
                return;
            }

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Guardar datos adicionales en Firestore
                await db.collection('socios').doc(user.uid).set({
                    nombre: name,
                    email: email,
                    estado_cuota: 'Pendiente de aprobación'
                });
                
                // Redirigir al área de socio
                window.location.href = 'area-socio.html';

            } catch (error) {
                errorEl.textContent = error.message;
            }
        });
    }

    // Formulario de Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');

            try {
                await auth.signInWithEmailAndPassword(email, password);
                window.location.href = 'area-socio.html';
            } catch (error) {
                errorEl.textContent = 'Email o contraseña incorrectos.';
            }
        });
    }

    // Proteger el área de socio y mostrar datos
    if (document.getElementById('member-area')) {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // El usuario está logueado
                const docRef = db.collection('socios').doc(user.uid);
                const doc = await docRef.get();

                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('member-name').textContent = data.nombre;
                    document.getElementById('member-email').textContent = data.email;
                    const statusEl = document.getElementById('member-status');
                    statusEl.textContent = data.estado_cuota;
                    if (data.estado_cuota.toLowerCase().includes('al día')) {
                        statusEl.className = 'status-ok';
                    } else {
                        statusEl.className = 'status-pending';
                    }
                } else {
                    // No se encontraron datos del socio
                    document.getElementById('member-name').textContent = 'Socio no encontrado';
                }
            } else {
                // El usuario no está logueado, redirigir
                window.location.href = 'sumate.html';
            }
        });
    }

    // Botón de Cerrar Sesión
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await auth.signOut();
                window.location.href = 'index.html';
            } catch (error) {
                console.error("Error al cerrar sesión: ", error);
            }
        });
    }

});