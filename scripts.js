// --- Efecto de Header con Sombra al Hacer Scroll ---
const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    });
}

// --- Animación de Entrada para Secciones ---
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

// --- Lógica para Pestañas en sumate.html ---
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

// --- Lógica para Filtro de Proyectos en proyectos.html ---
const filterContainer = document.querySelector('.filter-buttons');
if (filterContainer) {
    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.card-grid .card');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}