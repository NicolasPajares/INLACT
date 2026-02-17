// ===============================
// CLIENTES - INLACT
// ===============================

// Lista de clientes (placeholder)
let clientes = [
    {
        id: 1,
        nombre: "Depósito Casa",
        zona: "Villa María"
    },
    {
        id: 2,
        nombre: "Lácteos del Centro",
        zona: "Córdoba"
    },
    {
        id: 3,
        nombre: "Quesería San José",
        zona: "Río Cuarto"
    }
];

// Elementos del DOM
const listaEl = document.getElementById("listaClientes");
const buscadorEl = document.getElementById("buscadorClientes");

// ===============================
// Renderizar lista de clientes
// ===============================
function renderClientes(lista) {
    listaEl.innerHTML = "";

    if (lista.length === 0) {
        listaEl.innerHTML = "<li class='vacio'>No hay clientes cargados</li>";
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
            abrirCliente(cliente);
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
// Abrir ficha de cliente
// ===============================
function abrirCliente(cliente) {
    alert(
        `Cliente: ${cliente.nombre}\n` +
        `Zona: ${cliente.zona}\n\n` +
        `Próximo paso: ficha completa`
    );
}

// ===============================
// Inicializar
// ===============================
renderClientes(clientes);
