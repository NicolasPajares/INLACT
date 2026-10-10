
/*************************
 * FIREBASE
 *************************/
import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/*************************
 * ELEMENTOS
 *************************/
const listaEl = document.getElementById("listaCotizaciones");
const buscadorEl = document.getElementById("buscadorCotizaciones");
const btnNuevaCotizacion = document.getElementById("btnNuevaCotizacion");
const btnListaPrecios = document.getElementById("btnListaPrecios");

let cotizaciones = [];

/*************************
 * BOTONES PRINCIPALES
 *************************/
btnNuevaCotizacion.addEventListener("click", () => {
  window.location.href = "nueva-cotizacion.html";
});

btnListaPrecios.addEventListener("click", () => {
  window.location.href = "lista-precios.html";
});

/*************************
 * CARGAR COTIZACIONES
 *************************/
async function cargarCotizaciones() {
  listaEl.innerHTML = "<li>Cargando cotizaciones...</li>";
  cotizaciones = [];

  try {
    const q = query(
      collection(db, "cotizaciones"),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);

    snap.forEach(d => {
      cotizaciones.push({
        id: d.id,
        ...d.data()
      });
    });
  } catch (error) {
    console.error("Error cargando cotizaciones:", error);
    listaEl.innerHTML = "<li>No se pudieron cargar las cotizaciones.</li>";
    return;
  }

  if (cotizaciones.length === 0) {
    listaEl.innerHTML = "<li>No hay cotizaciones cargadas</li>";
    return;
  }

  renderCotizaciones(cotizaciones);
}

/*************************
 * FORMATEAR FECHA
 *************************/
function formatearFecha(fecha) {
  if (!fecha) return "--/--/----";

  try {
    const fechaReal = typeof fecha.toDate === "function"
      ? fecha.toDate()
      : new Date(fecha);

    if (Number.isNaN(fechaReal.getTime())) {
      return "--/--/----";
    }

    return fechaReal.toLocaleDateString("es-AR");
  } catch {
    return "--/--/----";
  }
}

/*************************
 * CERRAR MENÚS ABIERTOS
 *************************/
function cerrarMenus(excepto = null) {
  document.querySelectorAll(".menu-opciones-cotizacion").forEach(menu => {
    if (menu !== excepto) {
      menu.hidden = true;
    }
  });

  document.querySelectorAll(".btn-menu-cotizacion").forEach(boton => {
    if (!excepto || boton.nextElementSibling !== excepto) {
      boton.setAttribute("aria-expanded", "false");
    }
  });
}

document.addEventListener("click", event => {
  if (!event.target.closest(".cotizacion-menu-contenedor")) {
    cerrarMenus();
  }
});

/*************************
 * RENDERIZAR COTIZACIONES
 *************************/
function renderCotizaciones(lista) {
  listaEl.innerHTML = "";

  if (lista.length === 0) {
    listaEl.innerHTML = "<li>No se encontraron cotizaciones.</li>";
    return;
  }

  lista.forEach(c => {
    const li = document.createElement("li");
    li.className = "cliente-item";

    const info = document.createElement("div");
    info.className = "cliente-info";
    info.tabIndex = 0;
    info.setAttribute("role", "link");
    info.setAttribute(
      "aria-label",
      `Abrir cotización ${c.nombreCotizacion || ""}`
    );

    const fecha = document.createElement("small");
    fecha.textContent = formatearFecha(c.fecha);

    const cliente = document.createElement("strong");
    cliente.textContent = c.clienteNombre || "Cliente sin nombre";

    const nombre = document.createElement("small");
    nombre.className = "nombre-cotizacion";
    nombre.textContent = c.nombreCotizacion || "Cotización sin nombre";

    info.append(fecha, cliente, nombre);

    const abrirCotizacion = () => {
      window.location.href = `cotizacion.html?id=${encodeURIComponent(c.id)}`;
    };

    info.addEventListener("click", abrirCotizacion);
    info.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        abrirCotizacion();
      }
    });

    /*************************
     * MENÚ DE TRES PUNTOS
     *************************/
    const menuContenedor = document.createElement("div");
    menuContenedor.className = "cotizacion-menu-contenedor";

    const btnMenu = document.createElement("button");
    btnMenu.type = "button";
    btnMenu.className = "btn-menu-cotizacion";
    btnMenu.textContent = "⋮";
    btnMenu.title = "Opciones de cotización";
    btnMenu.setAttribute("aria-label", "Opciones de cotización");
    btnMenu.setAttribute("aria-expanded", "false");

    const menu = document.createElement("div");
    menu.className = "menu-opciones-cotizacion";
    menu.hidden = true;

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "editar-cotizacion";
    btnEditar.textContent = "Editar";

    btnEditar.addEventListener("click", event => {
      event.stopPropagation();
      window.location.href =
        `nueva-cotizacion.html?id=${encodeURIComponent(c.id)}`;
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "eliminar-cotizacion";
    btnEliminar.textContent = "Eliminar";

    btnEliminar.addEventListener("click", async event => {
      event.stopPropagation();

      const confirmado = confirm(
        `¿Querés eliminar la cotización "${c.nombreCotizacion || "Sin nombre"}" de ${c.clienteNombre || "este cliente"}?`
      );

      if (!confirmado) return;

      btnEliminar.disabled = true;
      btnEliminar.textContent = "Eliminando...";

      try {
        await deleteDoc(doc(db, "cotizaciones", c.id));
        cotizaciones = cotizaciones.filter(item => item.id !== c.id);

        const texto = buscadorEl.value.toLowerCase().trim();
        const filtradas = filtrarCotizaciones(texto);
        renderCotizaciones(filtradas);
      } catch (error) {
        console.error("Error eliminando cotización:", error);
        alert("No se pudo eliminar la cotización. Intentá nuevamente.");
        btnEliminar.disabled = false;
        btnEliminar.textContent = "Eliminar";
      }
    });

    btnMenu.addEventListener("click", event => {
      event.stopPropagation();

      const estabaAbierto = !menu.hidden;
      cerrarMenus();

      if (!estabaAbierto) {
        menu.hidden = false;
        btnMenu.setAttribute("aria-expanded", "true");
      }
    });

    menu.addEventListener("click", event => {
      event.stopPropagation();
    });

    menu.append(btnEditar, btnEliminar);
    menuContenedor.append(btnMenu, menu);
    li.append(info, menuContenedor);
    listaEl.appendChild(li);
  });
}

/*************************
 * BUSCADOR
 *************************/
function filtrarCotizaciones(texto) {
  return cotizaciones.filter(c =>
    (c.clienteNombre || "").toLowerCase().includes(texto) ||
    (c.nombreCotizacion || "").toLowerCase().includes(texto)
  );
}

buscadorEl.addEventListener("input", () => {
  renderCotizaciones(filtrarCotizaciones(
    buscadorEl.value.toLowerCase().trim()
  ));
});

/*************************
 * INICIO
 *************************/
cargarCotizaciones();
