document.getElementById("formNuevoCliente").addEventListener("submit", e => {
  e.preventDefault();

  const nombre = nombreCliente.value.trim();
  const localidad = localidadCliente.value.trim();
  const provincia = provinciaCliente.value.trim();
  const lat = parseFloat(latCliente.value);
  const lng = parseFloat(lngCliente.value);
  const radio = parseInt(radioCliente.value) || 1000;

  if (!nombre || isNaN(lat) || isNaN(lng)) {
    alert("❌ Completá nombre y coordenadas");
    return;
  }

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  clientes.push({
    id: "clientes_" + Date.now(),
    nombre,
    localidad,
    provincia,
    lat,
    lng,
    radio,
    tipo: "cliente",
    contacto: "",
    puesto: "",
    telefono: "",
    email: ""
  });

  localStorage.setItem("clientes", JSON.stringify(clientes));

  alert("✅ Cliente creado");
  window.location.href = "clientes.html";
});
