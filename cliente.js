// ===============================
// CLIENTE - INLACT
// ===============================

// Obtener ID
const params = new URLSearchParams(window.location.search);
const clienteId = Number(params.get("id"));

// Buscar cliente
const cliente = clientes.find(c => c.id === clienteId);

// Elementos DOM
const nombreEl = document.getElementById("clienteNombre");
const zonaEl = document.getElementById("clienteZona");

if (!cliente) {
    nombreEl.textContent = "Cliente no encontrado";
} else {
    nombreEl.textContent = cliente.nombre;
    zonaEl.textContent = cliente.zona;
}
