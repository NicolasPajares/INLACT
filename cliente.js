/********************************
 * 1️⃣ OBTENER ID DEL CLIENTE
 ********************************/
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  alert("No se recibió el ID del cliente");
}


/********************************
 * 2️⃣ OBTENER CLIENTES
 ********************************/
const clientes = JSON.parse(localStorage.getItem("clientes")) || [];


/********************************
 * 3️⃣ MOSTRAR FICHA CLIENTE
 ********************************/
const ficha = document.getElementById("fichaCliente");
const cliente = clientes.find(c => c.id === clienteId);

if (!cliente) {
  ficha.innerHTML = "<p>Cliente no encontrado</p>";
} else {
  ficha.innerHTML = `
    <h2>${cliente.nombre}</h2>
    <p><strong>Localidad:</strong> ${cliente.localidad || "-"}</p>
    <p><strong>Provincia:</strong> ${cliente.provincia || "-"}</p>
  `;
}


/********************************
 * 4️⃣ OBTENER VISITAS
 ********************************/
function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}


/********************************
 * 5️⃣ MOSTRAR VISITAS DEL CLIENTE
 ********************************/
const lista = document.getElementById("listaVisitas");
const visitasCliente = obtenerVisitas().filter(
  v => v.clienteId === clienteId
);

if (visitasCliente.length === 0) {
  lista.innerHTML = "<li>No hay visitas registradas</li>";
} else {
  visitasCliente
    .slice()
    .reverse()
    .forEach(v => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${v.fecha} ${v.hora}</strong><br>
        ${v.usuarioNombre}
      `;
      lista.appendChild(li);
    });
}
