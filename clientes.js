// ===============================
// CLIENTES - INLACT
// ===============================

// Elementos DOM
const listaEl = document.getElementById("listaClientes");
const buscadorEl = document.getElementById("buscadorClientes");

// Render listado
function renderClientes(lista) {
    listaEl.innerHTML = "";

    if (lista.length === 0) {
        listaEl.innerHTML = "<li class='empty'>No se encontraron clientes</li>";
        return;
    }

    lista.forEach(cliente => {
        const li = document.createElement("li");
        li.className = "cliente-item";
        li.innerHTML = `
            <strong>${cliente.nombre}</strong>
            <span>${cliente.zona}</span>
        `;
        li.addEventListener("click", () => {
            window.location.href = `cliente.html?id=${cliente.id}`;
        });
        listaEl.appendChild(li);
    });
}

// Inicial
renderClientes(clientes);

// Buscador
buscadorEl.addEventListener("input", () => {
    const texto = buscadorEl.value.toLowerCase();

    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(texto) ||
        c.zona.toLowerCase().includes(texto)
    );

    renderClientes(filtrados);
});

