document.addEventListener("DOMContentLoaded", () => {
  const listaEl = document.getElementById("listaClientes");
  const buscadorEl = document.getElementById("buscadorClientes");
  const btnNuevo = document.getElementById("btnNuevoCliente");

  if (!listaEl || !buscadorEl) {
    console.error("❌ Elementos HTML no encontrados");
    return;
  }

  if (btnNuevo) {
    btnNuevo.onclick = () => {
      window.location.href = "nuevo-cliente.html";
    };
  }

  // 🔑 SIEMPRE desde localStorage
  let clientes = obtenerClientes();

  function renderClientes(lista) {
    listaEl.innerHTML = "";

    if (lista.length === 0) {
      listaEl.innerHTML = "<li>No hay clientes cargados</li>";
      return;
    }

    lista.forEach(c => {
      const li = document.createElement("li");
      li.style.cursor = "pointer";

      li.innerHTML = `
        <strong>${c.nombre}</strong><br>
        <small>${c.localidad || ""} ${c.provincia || ""}</small>
      `;

      li.onclick = () => {
        window.location.href = `cliente.html?id=${c.id}`;
      };

      listaEl.appendChild(li);
    });
  }

  buscadorEl.addEventListener("input", () => {
    const texto = buscadorEl.value.toLowerCase();

    renderClientes(
      clientes.filter(c =>
        c.nombre.toLowerCase().includes(texto) ||
        (c.localidad || "").toLowerCase().includes(texto)
      )
    );
  });

  renderClientes(clientes);
});
