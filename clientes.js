document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("listaClientes");
  const buscador = document.getElementById("buscadorClientes");

  function render(listaClientes) {
    lista.innerHTML = "";

    if (listaClientes.length === 0) {
      lista.innerHTML = "<li>No hay clientes</li>";
      return;
    }

    listaClientes.forEach(c => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${c.nombre}</strong><br>
        <small>${c.localidad}, ${c.provincia}</small>
      `;

      li.onclick = () => {
        window.location.href = `cliente.html?id=${c.id}`;
      };

      lista.appendChild(li);
    });
  }

  buscador.addEventListener("input", () => {
    const txt = buscador.value.toLowerCase();

    render(
      clientes.filter(c =>
        c.nombre.toLowerCase().includes(txt) ||
        c.localidad.toLowerCase().includes(txt)
      )
    );
  });

  render(clientes);
});
