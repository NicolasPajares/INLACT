
import { db } from "https://nicolaspajares.github.io/INLACT/firebase.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**********************
 * ELEMENTOS DOM
 **********************/
const listaEl = document.getElementById("listaClientes");
const buscadorEl = document.getElementById("buscadorClientes");
const btnNuevo = document.getElementById("btnNuevoCliente");

let clientes = [];

/**********************
 * NUEVO CLIENTE
 **********************/
btnNuevo.addEventListener("click", () => {
  window.location.href = "nuevo-cliente.html";
});

/**********************
 * CERRAR MENÚS
 **********************/
document.addEventListener("click", () => {
  document.querySelectorAll(".menu-opciones-cliente")
    .forEach(menu => menu.remove());
});

/**********************
 * CARGAR CLIENTES
 **********************/
async function cargarClientes() {
  listaEl.innerHTML = "<li>Cargando clientes...</li>";

  try {
    const snap = await getDocs(collection(db, "clientes"));

    clientes = [];

    snap.forEach(d => {
      clientes.push({
        id: d.id,
        ...d.data()
      });
    });

    if (clientes.length === 0) {
      listaEl.innerHTML = "<li>No hay clientes cargados</li>";
      return;
    }

    filtrarClientes();
  } catch (error) {
    console.error("Error cargando clientes:", error);
    listaEl.innerHTML = "<li>Error al cargar los clientes.</li>";
  }
}

/**********************
 * MOSTRAR CLIENTES
 **********************/
function renderClientes(lista) {
  listaEl.innerHTML = "";

  if (lista.length === 0) {
    listaEl.innerHTML = "<li>No se encontraron clientes.</li>";
    return;
  }

  lista.forEach(c => {
    const li = document.createElement("li");
    li.className = "cliente-item";

    /* INFORMACIÓN DEL CLIENTE */
    const info = document.createElement("div");
    info.className = "cliente-info";

    const nombre = document.createElement("strong");
    nombre.textContent = c.nombre || "Sin nombre";

    const ubicacion = document.createElement("small");
    ubicacion.textContent =
      `${c.localidad || ""} ${c.provincia || ""}`.trim();

    info.appendChild(nombre);
    info.appendChild(document.createElement("br"));
    info.appendChild(ubicacion);

    info.addEventListener("click", () => {
      window.location.href = `cliente.html?id=${encodeURIComponent(c.id)}`;
    });

    /* CONTENEDOR DEL MENÚ */
    const contenedorMenu = document.createElement("div");
    contenedorMenu.className = "cliente-menu-contenedor";

    /* BOTÓN DE TRES PUNTOS */
    const btnMenu = document.createElement("button");
    btnMenu.type = "button";
    btnMenu.className = "btn-menu-cliente";
    btnMenu.textContent = "⋮";
    btnMenu.setAttribute("aria-label", "Acciones del cliente");
    btnMenu.setAttribute("aria-expanded", "false");

    btnMenu.addEventListener("click", (e) => {
      e.stopPropagation();

      const menuActual =
        contenedorMenu.querySelector(".menu-opciones-cliente");

      /* Si el menú ya está abierto, lo cerramos */
      if (menuActual) {
        menuActual.remove();
        btnMenu.setAttribute("aria-expanded", "false");
        return;
      }

      /* Cerrar cualquier otro menú abierto */
      document.querySelectorAll(".menu-opciones-cliente")
        .forEach(menu => menu.remove());

      document.querySelectorAll(".btn-menu-cliente")
        .forEach(b => b.setAttribute("aria-expanded", "false"));

      /* CREAR OPCIONES */
      const menu = document.createElement("div");
      menu.className = "menu-opciones-cliente";

      /* OPCIÓN EDITAR */
      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.textContent = "Editar";

      btnEditar.addEventListener("click", (ev) => {
        ev.stopPropagation();

        window.location.href =
          `nuevo-cliente.html?id=${encodeURIComponent(c.id)}`;
      });

      /* OPCIÓN ELIMINAR */
      const btnEliminar = document.createElement("button");
      btnEliminar.type = "button";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.className = "eliminar-cliente";

      btnEliminar.addEventListener("click", async (ev) => {
        ev.stopPropagation();

        const ok = confirm(
          `¿Querés borrar el cliente "${c.nombre || "Sin nombre"}"?`
        );

        if (!ok) return;

        try {
          await deleteDoc(doc(db, "clientes", c.id));

          menu.remove();
          await cargarClientes();
        } catch (error) {
          console.error("Error eliminando cliente:", error);
          alert("No se pudo eliminar el cliente. Intentá nuevamente.");
        }
      });

      menu.appendChild(btnEditar);
      menu.appendChild(btnEliminar);
      contenedorMenu.appendChild(menu);

      btnMenu.setAttribute("aria-expanded", "true");
    });

    contenedorMenu.appendChild(btnMenu);

    li.appendChild(info);
    li.appendChild(contenedorMenu);

    listaEl.appendChild(li);
  });
}

/**********************
 * BUSCADOR
 **********************/
function filtrarClientes() {
  const texto = buscadorEl.value.trim().toLowerCase();

  const filtrados = clientes.filter(c =>
    (c.nombre || "").toLowerCase().includes(texto) ||
    (c.localidad || "").toLowerCase().includes(texto) ||
    (c.provincia || "").toLowerCase().includes(texto)
  );

  renderClientes(filtrados);
}

buscadorEl.addEventListener("input", filtrarClientes);

/**********************
 * INICIO
 **********************/
cargarClientes();
