console.log("cliente.js cargado");

// ===============================
// OBTENER CLIENTE
// ===============================
const params = new URLSearchParams(window.location.search);
const clienteId = Number(params.get("id"));

const cliente = clientes.find(c => c.id === clienteId);

if (!cliente) {
  alert("Cliente no encontrado");
  window.location.href = "clientes.html";
}

// ===============================
// FICHA CLIENTE
// ===============================
const ficha = document.getElementById("fichaCliente");

ficha.innerHTML = `
  <h3>${cliente.nombre}</h3>
  <p><strong>Zona:</strong> ${cliente.zona}</p>
  <p><strong>Localidad:</strong> ${cliente.localidad}</p>
  <p><strong>Provincia:</strong> ${cliente.provincia}</p>

  <h4>Contactos</h4>
  <ul>
    ${cliente.contactos.map(c => `
      <li>
        <strong>${c.nombre}</strong><br>
        📱 ${c.telefono}<br>
        ✉️ ${c.email}
      </li>
    `).join("")}
  </ul>
`;

// ===============================
// VISITAS (DESDE LOCALSTORAGE)
// ===============================
function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

const todasLasVisitas = obtenerVisitas();

// filtramos SOLO las del cliente
const visitasCliente = todasLasVisitas.filter(
  v => Number(v.clienteId) === clienteId
);

const visitasEl = document.getElementById("listaVisitas");
visitasEl.innerHTML = "";

if (visitasCliente.length === 0) {
  visitasEl.innerHTML = "<li>No hay visitas registradas para este cliente.</li>";
} else {
  visitasCliente
    .sort((a, b) => b.id - a.id)
    .forEach(v => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${v.fecha} ${v.hora}</strong><br>
        ${v.usuarioNombre}
      `;
      visitasEl.appendChild(li);
    });
}
