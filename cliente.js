// ===============================
// CLIENTE - FICHA COMPLETA
// INLACT
// ===============================

// ===============================
// BASE DE CLIENTES (PRUEBA)
// ===============================
const clientes = [

    // ===============================
    // CLIENTE 1 - DEPÓSITO CASA
    // ===============================
    {
        id: 1,
        nombre: "Depósito Casa",
        localidad: "Villa María",
        provincia: "Córdoba",
        observaciones: "Cliente de prueba para testear funciones.",

        contactos: [
            {
                nombre: "Nicolás Pajares",
                telefono: "+549000000000",
                email: "test@inlact.com"
            }
        ],

        visitas: [
            {
                fecha: "2026-02-15",
                accion: "Prueba sistema",
                detalle: "Test desde casa"
            }
        ]
    },

    // ===============================
    // CLIENTE 2 - LÁCTEOS LA MANCHITA
    // ===============================
    {
        id: 2,
        nombre: "Lácteos La Manchita",
        localidad: "Oliva",
        provincia: "Córdoba",
        observaciones: "Cliente activo. Buen volumen en quesos.",

        contactos: [
            {
                nombre: "Antonio Marzioni",
                telefono: "+5493532490577",
                email: "antoniomarzioni@gmail.com"
            },
            {
                nombre: "Elizabeth Cassi",
                telefono: "+5493532416560",
                email: "lamanchitalacteos.ar@gmail.com"
            }
        ],

        visitas: [
            {
                fecha: "2026-02-10",
                accion: "Visita comercial",
                detalle: "Revisión de precios"
            },
            {
                fecha: "2026-01-22",
                accion: "Entrega",
                detalle: "Entrega de muestra"
            }
        ]
    }
];

// ===============================
// LEER ID DESDE URL
// ===============================
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

// Buscar cliente
const cliente = clientes.find(c => c.id === id);

// Seguridad mínima
if (!cliente) {
    alert("Cliente no encontrado");
    window.location.href = "clientes.html";
}

// ===============================
// ELEMENTOS DOM
// ===============================
document.getElementById("clienteNombre").textContent = cliente.nombre;
document.getElementById("clienteLocalidad").textContent = cliente.localidad;
document.getElementById("clienteProvincia").textContent = cliente.provincia;
document.getElementById("clienteObservaciones").textContent = cliente.observaciones;

// ===============================
// CONTACTOS
// ===============================
const contactosEl = document.getElementById("listaContactos");
contactosEl.innerHTML = "";

cliente.contactos.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
        <strong>${c.nombre}</strong><br>
        📱 ${c.telefono}<br>
        ✉️ ${c.email}
    `;
    contactosEl.appendChild(li);
});

// ===============================
// VISITAS
// ===============================
const visitasEl = document.getElementById("listaVisitasCliente");
visitasEl.innerHTML = "";

cliente.visitas.forEach(v => {
    const li = document.createElement("li");
    li.innerHTML = `
        <strong>${v.fecha}</strong><br>
        ${v.accion}<br>
        ${v.detalle}
    `;
    visitasEl.appendChild(li);
});

