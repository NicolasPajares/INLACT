// ===============================
// CLIENTES - INLACT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const listaEl = document.getElementById("listaClientes");
  const buscadorEl = document.getElementById("buscadorClientes");

  if (!listaEl) {
    console.error("❌ No existe #listaClientes");
    return;
  }

  if (typeof clientes === "undefined") {
    listaEl.innerHTML = "<li>Error: clientes no cargados</li>";
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

      li.innerHTML = `
        <strong>${c.nombre}</strong><br>
        <span>${c.localidad}, ${c.provincia}</span>
      `;

      li.addEventListener("click", () => {
        window.location.href = `cliente.html?id=${c.id}`;
      });

      listaEl.appendChild(li);
    });
  }

  if (buscadorEl) {
    buscadorEl.addEventListener("input", () => {
      const texto = buscadorEl.value.toLowerCase();
      renderClientes(
        clientes.filter(c =>
          c.nombre.toLowerCase().includes(texto)
        )
      );
    });
  }

  renderClientes(clientes);
});
