const clientes = [
  { id: 1, nombre: "Depósito Casa", ciudad: "Villa María" },
  { id: 2, nombre: "Lácteos San Juan", ciudad: "Córdoba" }
];

const lista = document.getElementById("listaClientes");

clientes.forEach(c => {
  const li = document.createElement("li");
  li.textContent = `${c.nombre} – ${c.ciudad}`;
  lista.appendChild(li);
});
