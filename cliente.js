console.log("cliente.js cargado");

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

const cliente = clientes.find(c => c.id === id);

if (!cliente) {
  alert("Cliente no encontrado");
  window.location.href = "clientes.html";
}

// ===== FICHA CLIENTE =====
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

// ===== VISITAS =====
const visitasEl = document.getElementById("listaVisitas");
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
