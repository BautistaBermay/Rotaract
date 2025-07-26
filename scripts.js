// El objeto 'firebase' es cargado por los scripts en cada archivo HTML.
const auth = firebase.auth();
const db = firebase.firestore();

// --- LÓGICA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica del Header (se reemplaza por la nueva función de auth)
    manejarEstadoDeAutenticacion();

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
    if (document.getElementById('actas-container')) {
        cargarContenido('actas');
    }
});

// --- NUEVA FUNCIÓN CENTRAL PARA MANEJAR LA SESIÓN ---
function manejarEstadoDeAutenticacion() {
    auth.onAuthStateChanged(user => {
        const headerContainer = document.querySelector('header .container');
        if (!headerContainer) return;

        // Limpiar cualquier menú existente para evitar duplicados
        const oldNav = document.getElementById('main-nav-container');
        if (oldNav) oldNav.remove();

        if (user) {
            // --- Usuario CONECTADO ---
            // Creamos el menú para socios
            const navHtml = `
                <div class="main-nav" id="main-nav-container">
                    <nav>
                        <a href="area-socio.html">MI PANEL</a>
                        <a href="proyectos.html">PROYECTOS</a>
                        <a href="noticias.html">NOTICIAS</a>
                        <a href="actas.html">ACTAS</a>
                    </nav>
                    <a href="#" id="logout-button" class="button button-primary">Cerrar Sesión</a>
                </div>
            `;
            headerContainer.insertAdjacentHTML('beforeend', navHtml);

            // Añadir funcionalidad al botón de logout
            document.getElementById('logout-button').addEventListener('click', (e) => {
                e.preventDefault();
                auth.signOut().then(() => {
                    window.location.href = 'index.html';
                });
            });

            // Proteger páginas si es necesario
            if (window.location.pathname.includes('area-socio.html') || window.location.pathname.includes('actas.html')) {
                protegerPaginasSocio(user);
            }

        } else {
            // --- Usuario DESCONECTADO ---
            // Creamos el menú público
            const navHtml = `
                <div class="main-nav" id="main-nav-container">
                    <nav>
                        <a href="index.html">INICIO</a>
                        <a href="quienes-somos.html">QUIÉNES SOMOS</a>
                        <a href="proyectos.html">PROYECTOS</a>
                        <a href="noticias.html">NOTICIAS</a>
                        <a href="contacto.html">CONTACTO</a>
                    </nav>
                    <a href="sumate.html" class="button button-primary">SUMATE</a>
                </div>
            `;
            headerContainer.insertAdjacentHTML('beforeend', navHtml);

            // Si intenta acceder a una página protegida, lo redirigimos
            if (window.location.pathname.includes('area-socio.html') || window.location.pathname.includes('actas.html')) {
                alert('Necesitas iniciar sesión para ver esta página.');
                window.location.href = 'sumate.html';
            }
        }
        
        // Efecto de sombra en el header al hacer scroll
        const header = document.querySelector('header');
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 10);
        });
    });
}


// --- Resto de las funciones (sin cambios, pero asegúrate de que estén todas) ---

function setupTabs() { /* ...código sin cambios... */ }
function setupAuthForms() { /* ...código sin cambios... */ }
function protegerPaginasSocio(user) {
    if (window.location.pathname.includes('area-socio.html')) {
        const docRef = db.collection('socios').doc(user.uid);
        docRef.get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                const nombreSocioEl = document.getElementById('nombre-socio');
                if(nombreSocioEl) nombreSocioEl.textContent = data.nombre;
                // ... y así para los otros campos
            }
        });
    }
}
async function cargarContenido(tipo) { /* ...código sin cambios... */ }
function renderItems(items, tipo, container) { /* ...código sin cambios... */ }
function renderActas(items, files) { /* ...código sin cambios... */ }
function renderProjectFilters(projects) { /* ...código sin cambios... */ }
function parseFrontmatter(text) { /* ...código sin cambios... */ }


// Por claridad, aquí está el código completo de las funciones que no cambiaron
function setupTabs(){const loginFormElement=document.getElementById("login-form");if(!loginFormElement)return;const registerFormElement=document.getElementById("register-form"),tabButtons=document.querySelectorAll(".tab-button");tabButtons.forEach(button=>{button.addEventListener("click",()=>{tabButtons.forEach(btn=>btn.classList.remove("active"));button.classList.add("active");const isLogin=button.textContent.includes("Iniciar Sesi\xF3n");loginFormElement.classList.toggle("active",isLogin),registerFormElement.classList.toggle("active",!isLogin)})})}
function setupAuthForms(){const registerForm=document.getElementById("registerForm");registerForm&&registerForm.addEventListener("submit",e=>{e.preventDefault();const name=document.getElementById("register-name").value,email=document.getElementById("register-email").value,password=document.getElementById("register-password").value,passwordConfirm=document.getElementById("register-password-confirm").value;if(password!==passwordConfirm)return void alert("Las contrase\xF1as no coinciden.");auth.createUserWithEmailAndPassword(email,password).then(userCredential=>db.collection("socios").doc(userCredential.user.uid).set({nombre:name,email:email,estadoCuota:"Pendiente",vencimiento:"N/A"})).then(()=>{alert("\xA1Registro exitoso! Ser\xE1s dirigido a tu panel."),window.location.href="area-socio.html"}).catch(error=>alert("Error al registrar: "+error.message))});const loginForm=document.getElementById("loginForm");loginForm&&loginForm.addEventListener("submit",e=>{e.preventDefault();const email=document.getElementById("login-email").value,password=document.getElementById("login-password").value;auth.signInWithEmailAndPassword(email,password).then(()=>{window.location.href="area-socio.html"}).catch(error=>alert("Error al iniciar sesi\xF3n: "+error.message))})}
async function cargarContenido(tipo){const container=document.getElementById(`${tipo}-container`);if(!container)return;const GITHUB_USER="BautistaBermay",GITHUB_REPO="Rotaract",API_URL=`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/_posts/${tipo}`;try{const response=await axios.get(API_URL),posts=response.data.filter(item=>item.name.endsWith(".md")||item.name.endsWith(".pdf"));if(0===posts.length)return void(container.innerHTML=`<p style="text-align:center;">A\xFAn no hay ${tipo} para mostrar.</p>`);container.innerHTML="",posts.sort((a,b)=>b.name.localeCompare(a.name));const allItemsPromises=posts.map(post=>axios.get(post.download_url,{responseType:post.name.endsWith(".pdf")?"blob":"text"}).then(res=>({data:res.data,frontmatter:parseFrontmatter(res.data)}))),allItemsData=await Promise.all(allItemsPromises.map(p=>p.catch(e=>e))),allItems=allItemsData.filter(item=>!(item instanceof Error)).map(item=>item.frontmatter);"actas"===tipo?renderActas(allItems,response.data):renderItems(allItems,tipo,container),"proyectos"===tipo&&renderProjectFilters(allItems)}catch(error){console.error(`Error al cargar ${tipo}:`,error),container.innerHTML=`<p style="color: red; text-align:center;">No se pudo cargar el contenido. Es posible que el repositorio de GitHub sea privado.</p>`}}
function renderActas(items,files){const container=document.getElementById("actas-container"),table=document.createElement("table");table.style.width="100%",table.style.borderCollapse="collapse",table.innerHTML=`
        <thead>
            <tr style="border-bottom: 2px solid var(--color-text-dark);">
                <th style="padding: 15px; text-align: left;">T\xEDtulo del Documento</th>
                <th style="padding: 15px; text-align: left;">Fecha</th>
                <th style="padding: 15px; text-align: right;">Descarga</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;const tbody=table.querySelector("tbody");items.forEach((item,index)=>{const file=files.find(f=>f.name.includes(item.title.substring(0,5))),row=document.createElement("tr");row.style.borderBottom="1px solid var(--color-border)";const date=new Date(item.date).toLocaleDateString("es-AR",{timeZone:"UTC"});row.innerHTML=`
            <td style="padding: 15px;">${item.title||"Sin T\xEDtulo"}</td>
            <td style="padding: 15px;">${date}</td>
            <td style="padding: 15px; text-align: right;">
                <a href="${item.pdf||file.download_url}" class="button button-primary" target="_blank" rel="noopener noreferrer">Descargar</a>
            </td>
        `,tbody.appendChild(row)}),container.appendChild(table)}
function renderItems(items,tipo,container){items.forEach(item=>{const card=document.createElement("article");card.className="card",card.dataset.category=item.category?.toLowerCase().replace(/\s+/g,"-")||"";const title=item.title||"Sin T\xEDtulo",image=item.image||"https://placehold.co/600x400",summary=item.summary||"",date=new Date(item.date).toLocaleDateString("es-AR",{timeZone:"UTC"}),meta="noticias"===tipo?`Publicado el ${date}`:`Categor\xEDa: ${item.category}`;card.innerHTML=`
            <img src="${image}" alt="${title}">
            <div class="card-content">
                <h3>${title}</h3>
                <p class="card-meta">${meta}</p>
                <p>${summary}</p>
                <a href="noticia-ejemplo.html">Leer más &rarr;</a> 
            </div>
        `,container.appendChild(card)})}
function renderProjectFilters(projects){const filterContainer=document.getElementById("project-filters");if(!filterContainer)return;const categories=["Todos",...new Set(projects.map(p=>p.category).filter(Boolean))];filterContainer.innerHTML="",categories.forEach(category=>{const button=document.createElement("button");button.className="filter-btn",button.textContent=category,button.dataset.filter=category.toLowerCase().replace(/\s+/g,"-"),"Todos"===category&&button.classList.add("active"),button.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(btn=>btn.classList.remove("active")),button.classList.add("active"),document.querySelectorAll(".card-grid .card").forEach(card=>{"Todos"===category||card.dataset.category===button.dataset.filter?card.style.display="flex":card.style.display="none"})}),filterContainer.appendChild(button)})}
function parseFrontmatter(text){const frontmatter={};const match=text.match(/---\s*([\s\S]*?)\s*---/);if(match){const yaml=match[1];yaml.split("\n").forEach(line=>{const parts=line.split(":");if(parts.length>=2){const key=parts[0].trim(),value=parts.slice(1).join(":").trim().replace(/"/g,"").replace(/'/g,"");frontmatter[key]=value}})}return frontmatter}