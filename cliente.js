// ===============================
// CLIENTE - INLACT
// ===============================

/*
Este archivo:
- Lee el ID del cliente desde la URL
- Muestra la ficha del cliente
- Filtra y muestra el historial de visitas
*/

// ===============================
// DATOS (provisorios)
// Luego los vamos a unificar
// ===============================

const clientes = [
    {
        id: "fabrica_001",
        nombre: "Depósito Casa",
        localidad: "Villa María",
        provincia: "Córdoba",
        observaciones: "Cliente base, visitas frecuentes",
        contactos: [
            {
                nombre: "Juan Pérez",
                telefono: "351 1234567",
                email: "juan@depositocasa.com"
            }
        ]
    }
];

// ===============================
// UTILIDADES STORAGE
// ===============================

function obtenerVisitas() {
    return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

// ===============================
// LEER ID CLIENTE
// ===============================

const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
    alert("Cliente no especificado");
}

// ===============================
// BUSCAR CLIENTE
// ===============================

const cliente = clientes.find(c => c.id === clienteId);

if (!cliente) {
    alert("Cliente no encontrado");
}

// ===============================
// ELEMENTOS DOM
// ===============================

const elNombre = document.getElementById("clienteNombre");
const elLocalidad = document.getElementById("clienteLocalidad");
const elProvincia = document.getElementById("clienteProvincia");
const elObservaciones = document.getElementById("clienteObservaciones");
const elContactos = document.getElementById("listaContactos");
const elVisitas = document.getElementById("listaVisitasCliente");

// ===============================
// RENDER FICHA CLIENTE
// ===============================

function renderCliente() {
    elNombre.textContent = cliente.nombre;
    elLocalidad.textContent = cliente.localidad;
    elProvincia.textContent = cliente.provincia;
    elObservaciones.textContent = cliente.observaciones || "—";

    elContactos.innerHTML = "";

    if (!cliente.contactos || cliente.contactos.length === 0) {
        elContactos.innerHTML = "<li>No hay contactos cargados</li>";
        return;
    }

    cliente.contactos.forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${c.nombre}</strong><br>
            📞 ${c.telefono}<br>
            ✉️ ${c.email}
        `;
        elContactos.appendChild(li);
    });
}

// ===============================
// RENDER HISTORIAL VISITAS
// ===============================

function renderVisitas() {
    const visitas = obtenerVisitas()
        .filter(v => v.clienteId === cliente.id)
        .reverse();

    elVisitas.innerHTML = "";

    if (visitas.length === 0) {
        elVisitas.innerHTML = "<li>No hay visitas registradas</li>";
        return;
    }

    visitas.forEach(v => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${v.fecha} ${v.hora}</strong><br>
            👤 ${v.usuarioNombre}<br>
            📝 ${v.accion || "Visita registrada"}
        `;
        elVisitas.appendChild(li);
    });
}

// ===============================
// INICIALIZAR
// ===============================

renderCliente();
renderVisitas();
