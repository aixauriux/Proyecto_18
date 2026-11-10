
const lenguaje = document.getElementById("lenguaje");
const resultado = document.getElementById("resultado");
const refrescar = document.getElementById("refrescar");
const reintentar = document.getElementById("reintentar");

let repositorios = [];
let repositorioAnterior = null;

// Cuando se selecciona un lenguaje
lenguaje.addEventListener("change", function () {
    if (lenguaje.value === "") {
        mostrarVacio();
    } else {
        buscarRepositorios();
    }
});

// Buscar otro repositorio
refrescar.addEventListener("click", function () {
    mostrarRepositorio();
});

// Intentar nuevamente si ocurre un error
reintentar.addEventListener("click", function () {
    buscarRepositorios();
});

// Estado vacío
function mostrarVacio() {
    resultado.className = "";
    resultado.textContent = "Selecciona un lenguaje para comenzar.";

    refrescar.hidden = true;
    reintentar.hidden = true;

    repositorios = [];
    repositorioAnterior = null;
}

// Estado de carga
function mostrarCarga() {
    resultado.className = "cargando";
    resultado.textContent = "Cargando repositorios, espera un momento...";

    refrescar.hidden = true;
    reintentar.hidden = true;
    lenguaje.disabled = true;
}

// Estado de error
function mostrarError(mensaje) {
    resultado.className = "error";
    resultado.textContent = mensaje;

    refrescar.hidden = true;
    reintentar.hidden = false;
}

// Consultar la API de GitHub
async function buscarRepositorios() {
    const seleccionado = lenguaje.value;

    mostrarCarga();

    try {
        const url = "https://api.github.com/search/repositories?q=language:" +
            encodeURIComponent(seleccionado) +
            "&sort=stars&order=desc&per_page=100";

        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error("No se pudo consultar GitHub.");
        }

        const datos = await respuesta.json();

        // Evitar mostrar resultados de una selección anterior
        if (lenguaje.value !== seleccionado) {
            return;
        }

        repositorios = datos.items || [];
        repositorioAnterior = null;

        if (repositorios.length === 0) {
            mostrarError("No se encontraron repositorios.");
            return;
        }

        mostrarRepositorio();

    } catch (error) {
        if (lenguaje.value === seleccionado) {
            mostrarError("Ocurrió un error al buscar. Intenta nuevamente.");
        }

    } finally {
        lenguaje.disabled = false;
    }
}

// Mostrar un repositorio aleatorio
function mostrarRepositorio() {
    if (repositorios.length === 0) {
        mostrarVacio();
        return;
    }

    let numero;

    do {
        numero = Math.floor(Math.random() * repositorios.length);
    } while (
        repositorios.length > 1 &&
        numero === repositorioAnterior
    );

    repositorioAnterior = numero;

    const repo = repositorios[numero];

    resultado.className = "";
    resultado.replaceChildren();

    const titulo = document.createElement("h2");
    titulo.textContent = repo.name;

    const descripcion = document.createElement("p");
    descripcion.textContent = repo.description || "Sin descripción disponible.";

    const datos = document.createElement("p");
    datos.className = "datos";

    const estrellas = document.createElement("span");
    estrellas.textContent = "⭐ " + repo.stargazers_count;

    const forks = document.createElement("span");
    forks.textContent = "⑂ Forks: " + repo.forks_count;

    const issues = document.createElement("span");
    issues.textContent = "Issues: " + repo.open_issues_count;

    datos.append(estrellas, forks, issues);

    const enlace = document.createElement("a");
    enlace.href = repo.html_url;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    enlace.textContent = "Ver repositorio en GitHub";

    resultado.append(titulo, descripcion, datos, enlace);

    refrescar.hidden = false;
    reintentar.hidden = true;
}

// Mostrar el estado inicial
mostrarVacio();
