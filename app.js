
// 1) clases y objetos

class SesionEstudio {
    constructor(materia, duracion, fecha) {
        this.materia = materia;
        this.duracion = duracion; 
        this.fecha = fecha;
    }
}

// variables globales e inicialización de arrays
let listaSesiones = [];
let tSegundos = 0;
let cronometroInterval = null;


// 2) navegacion tipo SPA 

const secciones = {
    'nav-registro': document.getElementById('registro-tiempo'),
    'nav-historial': document.getElementById('historia'),
    'nav-consejos': document.getElementById('sec-consejos') 
};

// función flecha para la navegación de la SPA
const irASeccion = (idBoton) => {
    for (const key in secciones) {
        if (secciones[key]) {
            if (key === idBoton) {
                secciones[key].classList.remove('d-none');
            } else {
                secciones[key].classList.add('d-none');
            }
        }
    }
};

document.querySelectorAll('nav a').forEach(enlace => {
    enlace.addEventListener('click', (e) => {
        e.preventDefault();
        irASeccion(e.target.id);
    });
});


// 3) logica del cronometro

const display = document.getElementById('pantalla-cronometro');
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnStop = document.getElementById('btn-stop');

// función declarada tradicional
function formatearTiempo(segundosTotales) {
    let hrs = Math.floor(segundosTotales / 3600);
    let mins = Math.floor((segundosTotales % 3600) / 60);
    let secs = segundosTotales % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

btnStart.addEventListener('click', () => {
    // condicional para evitar duplicidad de intervalos
    if (!cronometroInterval) {
        cronometroInterval = setInterval(() => {
            tSegundos++;
            display.textContent = formatearTiempo(tSegundos);
        }, 1000);
        document.getElementById('mensaje-timer').textContent = "⏱️ Cronómetro corriendo... ¡A estudiar!";
    }
});

btnPause.addEventListener('click', () => {
    clearInterval(cronometroInterval);
    cronometroInterval = null;
    document.getElementById('mensaje-timer').textContent = "⏸️ Cronómetro en pausa.";
});

btnStop.addEventListener('click', () => {
    if (tSegundos === 0) {
        document.getElementById('mensaje-timer').textContent = "⚠️ Primero debes iniciar el cronómetro.";
        return;
    }

    clearInterval(cronometroInterval);
    cronometroInterval = null;
    
    const tiempoFormateado = formatearTiempo(tSegundos);
    document.getElementById('tiempo-manual').value = tiempoFormateado;
    
    if (!document.getElementById('fecha').value) {
        document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('mensaje-timer').textContent = "✅ Tiempo bloqueado y cargado en el formulario.";
});


// 4) formulario dl usuario

const form = document.getElementById('sesion-ed');

form.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const materiaInput = document.getElementById('materia').value.trim();
    const tiempoInput = document.getElementById('tiempo-manual').value;
    const fechaInput = document.getElementById('fecha').value;
    
    let formularioValido = true;
    
    // Expresión regular obligatoria (Materia alfabetica/numerica entre 3 y 30 letras)
    const regexMateria = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,30}$/;

    if (!regexMateria.test(materiaInput)) {
        document.getElementById('error-materia').textContent = "Materia inválida (Usa entre 3 y 30 letras, sin símbolos).";
        formularioValido = false;
    } else {
        document.getElementById('error-materia').textContent = "";
    }

    if (tiempoInput === "") {
        document.getElementById('error-tiempo').textContent = "Debes usar el cronómetro para registrar tiempo.";
        formularioValido = false;
    } else {
        document.getElementById('error-tiempo').textContent = "";
    }

    if (!fechaInput) {
        document.getElementById('error-fecha').textContent = "Por favor selecciona una fecha.";
        formularioValido = false;
    } else {
        document.getElementById('error-fecha').textContent = "";
    }

    if (formularioValido) {
        const nuevaSesion = new SesionEstudio(materiaInput, tiempoInput, fechaInput);
        
        listaSesiones.push(nuevaSesion); 
        guardarEnStorage();             
        renderizarTabla();              
        
        tSegundos = 0;
        display.textContent = "00:00:00";
        form.reset();
        document.getElementById('mensaje-timer').textContent = "";
        
        alert("¡Sesión registrada con éxito!");
        irASeccion('nav-historial'); 
    }
});


// 5) webstorage

function guardarEnStorage() {
    localStorage.setItem('sesionesEstudio', JSON.stringify(listaSesiones));
}

function cargarDesdeStorage() {
    const datos = localStorage.getItem('sesionesEstudio');
    if (datos) {
        listaSesiones = JSON.parse(datos);
        renderizarTabla();
    }
}

function renderizarTabla() {
    const tablaBody = document.getElementById('lista-de-sesiones');
    if (!tablaBody) return;
    
    tablaBody.innerHTML = ""; 
    
    // bucle clásico (for) 
    for (let i = 0; i < listaSesiones.length; i++) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${listaSesiones[i].materia}</td>
            <td>${listaSesiones[i].duracion}</td>
            <td>${listaSesiones[i].fecha}</td>
            <td>
                <button type="button" style="background-color: #e71d36; color: white; padding: 5px 10px; font-size: 0.9rem;" onclick="eliminarSesion(${i})">
                    🗑️
                </button>
            </td>
        `;
        tablaBody.appendChild(fila);
    }
}

function eliminarSesion(index) {
    if (confirm(`¿Quieres borrar la sesión?`)) {
        listaSesiones.splice(index, 1);
        guardarEnStorage();
        renderizarTabla();
    }
}


// 6) API

function obtenerConsejoAPI() {
    const contenedorTexto = document.getElementById('consejo-texto');
    if (!contenedorTexto) return;
    
    contenedorTexto.textContent = "Buscando inspiración en la nube... 🧠";

    // API externa
    fetch('https://api.adviceslip.com/advice')
        .then(response => {
            if (!response.ok) throw new Error("Error al conectar con la API");
            return response.json(); 
        })
        .then(data => {
            const consejoIngles = data.slip.advice;
            
            // usamos una segunda API externa (MyMemory) mediante Fetch para traducir el consejo al español en tiempo real
            return fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(consejoIngles)}&langpair=en|es`);
        })
        .then(response => response.json())
        .then(traduccionData => {
            // extraemos el texto ya traducido al español
            const consejoEspanol = traduccionData.responseData.translatedText;
            
            // modificamos dinámicamente el DOM para mostrar el consejo en español
            contenedorTexto.textContent = `"${consejoEspanol}"`;
        })
        .catch(error => {
            // banco de consejos
            const respaldos = [
                "El secreto para avanzar es comenzar. Enfócate en un bloque a la vez.",
                "La persistencia vence a la inteligencia. Si no sale hoy, saldrá mañana.",
                "Descansar también es parte del estudio. Mantén tu mente fresca.",
                "La práctica hace al maestro. Escribir código es la única forma de aprender."
            ];
            const azar = Math.floor(Math.random() * respaldos.length);
            contenedorTexto.textContent = `🧠 "${respaldos[azar]}"`;
            console.error("Detalle del error en Fetch:", error);
        });
}

const btnFetch = document.getElementById('btn-fetch');
if (btnFetch) {
    btnFetch.addEventListener('click', obtenerConsejoAPI);
}

// 7) menu hamburguesa y flotante de musica

const hamburgerBtn = document.getElementById('btn-hm');
const navMenu = document.getElementById('nav-menu');

if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        hamburgerBtn.classList.toggle('open'); 
    });

    document.querySelectorAll('#nav-menu a').forEach(enlace => {
        enlace.addEventListener('click', () => {
            navMenu.classList.remove('show');
            hamburgerBtn.classList.remove('open');
        });
    });
}

const btnMusicFloater = document.getElementById('btn-music-floater');
const musicOptions = document.getElementById('opciones');

if (btnMusicFloater && musicOptions) {
    btnMusicFloater.addEventListener('click', (e) => {
        e.stopPropagation(); 
        musicOptions.classList.toggle('d-none');
    });

    document.querySelectorAll('#opciones a').forEach(enlace => {
        enlace.addEventListener('click', () => {
            musicOptions.classList.add('d-none');
        });
    });

    document.addEventListener('click', (e) => {
        if (!musicOptions.contains(e.target) && e.target !== btnMusicFloater) {
            musicOptions.classList.add('d-none');
        }
    });
}

// inicialización general al cargar la ventana
window.onload = () => {
    cargarDesdeStorage();
    obtenerConsejoAPI(); // carga el primer consejo automáticamente al abrir
};