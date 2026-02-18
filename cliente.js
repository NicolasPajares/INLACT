console.log("cliente.js cargado");

// ===============================
// 1️⃣ OBTENER ID DESDE URL
// ===============================
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  alert("Cliente no especificado");
  window.location.href = "clientes.html";
}

// ===============================
// 2️⃣ BUSCAR CLIENTE
// ===============================
const cliente = clientes.find(c => String(c.id) === String(clienteId));

if (!cliente) {
  alert("Cliente no encontrado");
  window.location.href = "clientes.html";
}

// ===============================
// 3️⃣ MOSTRAR FICHA CLIENTE
// ===============================
const ficha = document.getElementById("fichaCliente");

ficha.innerHTML = `
  <h3>${cliente.nombre}</h3>
  <p><strong>Zona:</strong> ${cliente.zona || "-"}</p>
  <p><strong>Localidad:</strong> ${cliente.localidad || "-"}</p>
  <p><strong>Provincia:</strong> ${cliente.provincia || "-"}</p>
`;

// ===============================
// 4️⃣ OBTENER VISITAS GLOBALES
// ===============================
function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

// ===============================
// 5️⃣ FILTRAR VISITAS DEL CLIENTE
// ===============================

const visitasCliente = obtenerVisitas().filter(v =>
  v.cliente && v.cliente.toLowerCase() === cliente.nombre.toLowerCase()
);
// ===============================
// 6️⃣ MOSTRAR VISITAS
// ===============================
const lista = document.getElementById("listaVisitas");
lista.innerHTML = "";

if (visitasCliente.length === 0) {
  lista.innerHTML = "<li>No hay visitas registradas.</li>";
} else {
  visitasCliente
    .slice()
    .reverse()
    .forEach(v => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${v.fecha} ${v.hora}</strong><br>
        ${v.cliente}
      `;
      lista.appendChild(li);
    });
}

