// ===============================
// CLIENTES - INLACT
// ===============================

// Base de clientes (resumen)
const clientes = [
    {
        id: 1,
        nombre: "Depósito Casa",
        zona: "Villa María"
    },
    {
        id: 2,
        nombre: "Lácteos La Manchita",
        zona: "Oliva, Córdoba"
    }
];

// Elementos DOM
const listaEl = document.getElementById("listaClientes");
const buscadorEl = document.getElementById("buscadorClientes");

// ===============================
// Renderizar lista
// ===============================
function renderClientes(lista) {
    listaEl.innerHTML = "";

    if (lista.length === 0) {
        listaEl.innerHTML = "<li class='vacio'>No hay clientes</li>";
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

// ===============================
// Buscador
// ===============================
buscadorEl.addEventListener("input", () => {
    const texto = buscadorEl.value.toLowerCase();

    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(texto)
    );

    renderClientes(filtrados);
});

// ===============================
// Init
// ===============================
renderClientes(clientes);
