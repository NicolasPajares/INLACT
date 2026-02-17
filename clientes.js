// ===============================
// CLIENTES - INLACT
// ===============================

const listaEl = document.getElementById("listaClientes");
const buscadorEl = document.getElementById("buscadorClientes");

function renderClientes(lista) {
  listaEl.innerHTML = "";

  if (lista.length === 0) {
    listaEl.innerHTML = "<li>No hay clientes</li>";
    return;
  }

  lista.forEach(c => {
    const li = document.createElement("li");
    li.className = "cliente-item";
    li.innerHTML = `<strong>${c.nombre}</strong> <span>${c.zona}</span>`;

    li.onclick = () => {
      window.location.href = `cliente.html?id=${c.id}`;
    };

    listaEl.appendChild(li);
  });
}

buscadorEl.addEventListener("input", () => {
  const texto = buscadorEl.value.toLowerCase();
  renderClientes(
    clientes.filter(c => c.nombre.toLowerCase().includes(texto))
  );
});

renderClientes(clientes);

