document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  const nombreEl = document.getElementById("clienteNombre");
  const datosEl = document.getElementById("clienteDatos");
  const visitasEl = document.getElementById("listaVisitasCliente");

  if (!clienteId) {
    nombreEl.textContent = "Cliente no especificado";
    return;
  }

  // ===============================
  // DATOS DESDE STORAGE (igual app.js)
  // ===============================

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const visitas = JSON.parse(localStorage.getItem("visitas_global")) || [];

  const cliente = clientes.find(c => c.id === clienteId);

  if (!cliente) {
    nombreEl.textContent = "Cliente no encontrado";
    return;
  }

  // ===============================
  // MOSTRAR DATOS DEL CLIENTE
  // ===============================

  nombreEl.textContent = cliente.nombre;

  datosEl.innerHTML = `
    <p><strong>Localidad:</strong> ${cliente.localidad}</p>
    <p><strong>Provincia:</strong> ${cliente.provincia}</p>
    <p><strong>ID:</strong> ${cliente.id}</p>
  `;

  // ===============================
  // HISTORIAL DE VISITAS DEL CLIENTE
  // ===============================

  const visitasCliente = visitas.filter(
    v => v.clienteId === cliente.id
  );

  if (visitasCliente.length === 0) {
    visitasEl.innerHTML = "<li>No hay visitas registradas</li>";
    return;
  }

  visitasCliente.forEach(v => {
    const li = document.createElement("li");
    li.className = "visita-item";

    li.innerHTML = `
      <strong>${v.fecha} ${v.hora}</strong><br>
      <small>${v.usuarioNombre}</small>
    `;

    visitasEl.appendChild(li);
  });
});
