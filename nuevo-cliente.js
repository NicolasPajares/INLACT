import { db } from "./firebase.js";
import { collection, addDoc } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document
  .getElementById("formNuevoCliente")
  .addEventListener("submit", async e => {
    e.preventDefault();

    const cliente = {
      nombre: nombre.value.trim(),
      localidad: localidad.value.trim(),
      provincia: provincia.value.trim(),
      lat: parseFloat(lat.value),
      lng: parseFloat(lng.value),
      radio: parseInt(radio.value) || 1000,

      // campos futuros
      contacto: "",
      puesto: "",
      telefono: "",
      email: "",
      observaciones: "",

      tipo: "cliente"
    };

    if (!cliente.nombre || isNaN(cliente.lat) || isNaN(cliente.lng)) {
      alert("❌ Completá nombre, latitud y longitud");
      return;
    }

    try {
      await addDoc(collection(db, "clientes"), cliente);
      alert("✅ Cliente creado correctamente");
      location.href = "clientes.html";
    } catch (error) {
      console.error("Error guardando cliente:", error);
      alert("❌ Error al crear cliente");
    }
  });
