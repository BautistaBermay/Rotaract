// --- Lógica General del Sitio ---

// Efecto de Header con Sombra al Hacer Scroll
const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    });
}

// Animación de Entrada para Secciones
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

// Lógica para Pestañas en sumate.html
const loginForm = document.getElementById('login-form');
if (loginForm) {
    const registerForm = document.getElementById('register-form');
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const isLogin = button.textContent.includes('Iniciar Sesión');
            loginForm.classList.toggle('active', isLogin);
            registerForm.classList.toggle('active', !isLogin);
        });
    });
}

// --- Lógica para Cargar Contenido del CMS ---

// Función para "parsear" (extraer) la información de los archivos de noticias
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

// Función para cargar noticias en la página
async function cargarNoticias() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return; // Salir si no estamos en la página de noticias

    // IMPORTANTE: Reemplaza con tu usuario y nombre de repositorio
    const GITHUB_USER = 'BautistaBermay';
    const GITHUB_REPO = 'Rotaract';
    const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/_posts/noticias`;

    try {
        const response = await axios.get(API_URL);
        const posts = response.data.filter(item => item.name.endsWith('.md'));

        if (posts.length === 0) {
            newsContainer.innerHTML = '<p>Aún no hay noticias publicadas. ¡Crea la primera desde el panel de administración!</p>';
            return;
        }

        newsContainer.innerHTML = ''; // Limpiar mensaje de "cargando"

        // Ordenar posts por fecha (del más nuevo al más viejo)
        posts.sort((a, b) => b.name.localeCompare(a.name));

        for (const post of posts) {
            const postResponse = await axios.get(post.download_url);
            const frontmatter = parseFrontmatter(postResponse.data);

            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <img src="${frontmatter.image || 'https://placehold.co/600x400'}" alt="${frontmatter.title}">
                <div class="card-content">
                    <h3>${frontmatter.title || 'Sin Título'}</h3>
                    <p class="card-meta">Publicado el ${new Date(frontmatter.date).toLocaleDateString('es-AR', { timeZone: 'UTC' })}</p>
                    <p>${frontmatter.summary || ''}</p>
                    <a href="#">Leer más &rarr;</a> 
                </div>
            `;
            newsContainer.appendChild(card);
        }
    } catch (error) {
        console.error('Error al cargar las noticias:', error);
        newsContainer.innerHTML = `<p>Hubo un error al cargar las noticias desde GitHub. Revisa la consola para más detalles.</p>`;
    }
}

// Ejecutar la función para cargar noticias cuando la página esté lista
document.addEventListener('DOMContentLoaded', cargarNoticias);