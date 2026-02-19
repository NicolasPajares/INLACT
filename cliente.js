function obtenerClientes() {
  let clientes = JSON.parse(localStorage.getItem("clientes"));

  if (!clientes || clientes.length === 0) {
    clientes = CLIENTES_INICIALES;
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }

  return clientes;
}

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

  if (typeof clientes === "undefined") {
    nombreEl.textContent = "Error: clientes no cargados";
    return;
  }


  if (!cliente) {
    nombreEl.textContent = "Cliente no encontrado";
    return;
  }

  // DATOS DEL CLIENTE
  nombreEl.textContent = cliente.nombre;
  datosEl.innerHTML = `
    <p><strong>Localidad:</strong> ${cliente.localidad}</p>
    <p><strong>Provincia:</strong> ${cliente.provincia}</p>
    <p><strong>ID:</strong> ${cliente.id}</p>
  `;

  // HISTORIAL
  const visitas = JSON.parse(localStorage.getItem("visitas_global")) || [];

  const visitasCliente = visitas
    .filter(v => String(v.clienteId) === String(cliente.id))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  visitasEl.innerHTML = "";

  if (visitasCliente.length === 0) {
    visitasEl.innerHTML = "<li>No hay visitas registradas</li>";
    return;
  }

  visitasCliente.forEach(v => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${v.fecha} ${v.hora}</strong><br>
      <small>${v.usuarioNombre}</small>
    `;
    visitasEl.appendChild(li);
  });
});


