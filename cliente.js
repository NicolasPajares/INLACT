// ===============================
// CLIENTE - FICHA COMPLETA
// INLACT
// ===============================

// ===============================
// DATOS DEL CLIENTE (ejemplo real)
// ===============================
const cliente = {
    id: 1,
    nombre: "Lácteos La Manchita",
    localidad: "Oliva",
    provincia: "Córdoba",

    ubicacion: {
        lat: -32.0416,
        lng: -63.5674
    },

    observaciones: "Cliente activo. Buen volumen en quesos y suero. Buen trato comercial.",

    contactos: [
        {
            nombre: "Antonio Marzioni",
            telefono: "+5493532490577",
            email: "antoniomarzioni@gmail.com"
        },
        {
            nombre: "Elizabeth Cassi",
            telefono: "+5493532416560",
            email: "Elizabethscassi@gmail.com",
            email2: "lamanchitalacteos.ar@gmail.com"
        }
    ],

    visitas: [
        {
            fecha: "2026-02-10",
            vendedor: "Nicolás Pajares",
            accion: "Visita comercial",
            detalle: "Se conversó sobre precios de WPC 35."
        },
        {
            fecha: "2026-01-22",
            vendedor: "Nicolás Pajares",
            accion: "Entrega",
            detalle: "Entrega de muestra de proteína."
        }
    ]
};

// ===============================
// ELEMENTOS DOM
// ===============================
const nombreEl = document.getElementById("clienteNombre");
const localidadEl = document.getElementById("clienteLocalidad");
const provinciaEl = document.getElementById("clienteProvincia");
const observacionesEl = document.getElementById("clienteObservaciones");
const listaContactosEl = document.getElementById("listaContactos");
const listaVisitasEl = document.getElementById("listaVisitasCliente");

// ===============================
// CARGAR DATOS CLIENTE
// ===============================
function cargarCliente() {

    nombreEl.textContent = cliente.nombre;
    localidadEl.textContent = cliente.localidad;
    provinciaEl.textContent = cliente.provincia;
    observacionesEl.textContent = cliente.observaciones;

    // Contactos
    listaContactosEl.innerHTML = "";
    cliente.contactos.forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${c.nombre}</strong><br>
            📱 <a href="https://wa.me/${c.telefono.replace(/\D/g, "")}" target="_blank">${c.telefono}</a><br>
            ✉️ <a href="mailto:${c.email}">${c.email}</a>
            ${c.email2 ? `<br>✉️ <a href="mailto:${c.email2}">${c.email2}</a>` : ""}
        `;
        listaContactosEl.appendChild(li);
    });

    // Visitas
    listaVisitasEl.innerHTML = "";
    cliente.visitas.forEach(v => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${v.fecha}</strong> – ${v.vendedor}<br>
            <em>${v.accion}</em><br>
            ${v.detalle}
        `;
        listaVisitasEl.appendChild(li);
    });
}

// ===============================
// INICIALIZAR
// ===============================
cargarCliente();
