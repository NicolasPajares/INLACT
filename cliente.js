// ===============================
// CLIENTE - INLACT
// ===============================

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

const cliente = clientes.find(c => c.id === id);

if (!cliente) {
  alert("Cliente no encontrado");
  window.location.href = "clientes.html";
}

// Datos básicos
document.getElementById("clienteNombre").textContent = cliente.nombre;
document.getElementById("clienteLocalidad").textContent = cliente.localidad;
document.getElementById("clienteProvincia").textContent = cliente.provincia;
document.getElementById("clienteObservaciones").textContent =
  cliente.observaciones || "";

// Contactos
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

// Visitas
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
