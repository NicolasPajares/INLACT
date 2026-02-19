function obtenerClientes() {
  let clientes = JSON.parse(localStorage.getItem("clientes"));

  if (!clientes || clientes.length === 0) {
    clientes = CLIENTES_INICIALES;
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }

  return clientes;
}

document.getElementById("btnNuevoCliente").addEventListener("click", () => {
  window.location.href = "nuevo-cliente.html";
});

document.addEventListener("DOMContentLoaded", () => {
  const listaEl = document.getElementById("listaClientes");
  const buscadorEl = document.getElementById("buscadorClientes");

  if (!listaEl || !buscadorEl) return;

  // ✅ LEEMOS DESDE LOCALSTORAGE
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  if (clientes.length === 0) {
    listaEl.innerHTML = "<li>No hay clientes cargados</li>";
    return;
  }

  function renderClientes(lista) {
    listaEl.innerHTML = "";

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
    const t = buscadorEl.value.toLowerCase();
    renderClientes(
      clientes.filter(c =>
        c.nombre.toLowerCase().includes(t) ||
        (c.localidad || "").toLowerCase().includes(t)
      )
    );
  });

  renderClientes(clientes);
});

