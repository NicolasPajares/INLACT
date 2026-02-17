console.log("cliente.js cargado");

// ===============================
// OBTENER ID DEL CLIENTE
// ===============================
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

// ===============================
// BUSCAR CLIENTE
// ===============================
const cliente = clientes.find(c => c.id === id);

if (!cliente) {
  alert("Cliente no encontrado");
  window.location.href = "clientes.html";
}

// ===============================
// FICHA DEL CLIENTE
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
// VISITAS DEL CLIENTE (GLOBAL)
// ===============================
const visitasGlobales = JSON.parse(localStorage.getItem("visitas_global")) || [];

const visitasCliente = visitasGlobales.filter(v => v.clienteId === cliente.id);

const visitasEl = document.getElementById("listaVisitas");
visitasEl.innerHTML = "";

if (visitasCliente.length === 0) {
  visitasEl.innerHTML = "<li>No hay visitas registradas</li>";
} else {
  visitasCliente
    .sort((a, b) => b.id - a.id)
    .forEach(v => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${v.fecha} ${v.hora}</strong><br>
        ${v.accion}<br>
        ${v.detalle}
      `;
      visitasEl.appendChild(li);
    });
}
