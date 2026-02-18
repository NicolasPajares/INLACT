document.addEventListener("DOMContentLoaded", () => {
  const listaEl = document.getElementById("listaClientes");
  const buscadorEl = document.getElementById("buscadorClientes");

  if (!listaEl || !buscadorEl) {
    console.error("❌ Elementos HTML no encontrados");
    return;
  }

  // ===============================
  // CARGAR CLIENTES DESDE LOCALSTORAGE
  // ===============================
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  if (clientes.length === 0) {
    listaEl.innerHTML = "<li>No hay clientes cargados</li>";
    return;
  }

  function renderClientes(lista) {
    listaEl.innerHTML = "";

    if (lista.length === 0) {
      listaEl.innerHTML = "<li>No hay clientes</li>";
      return;
    }

    lista.forEach(c => {
      const li = document.createElement("li");
      li.className = "cliente-item";
      li.style.cursor = "pointer";

      li.innerHTML = `
        <strong>${c.nombre}</strong><br>
        <small>${c.localidad}, ${c.provincia}</small>
      `;

      li.addEventListener("click", () => {
        const url = `cliente.html?id=${c.id}`;
        console.log("➡️ Navegando a:", url);
        window.location.href = url;
      });

      listaEl.appendChild(li);
    });
  }

  buscadorEl.addEventListener("input", () => {
    const texto = buscadorEl.value.toLowerCase();

    renderClientes(
      clientes.filter(c =>
        c.nombre.toLowerCase().includes(texto) ||
        c.localidad.toLowerCase().includes(texto)
      )
    );
  });

  renderClientes(clientes);
});
