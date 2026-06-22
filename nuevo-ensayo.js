// nuevo-ensayo.js

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("formNuevoEnsayo");

  if (!form) {
    console.error("❌ No se encontró el formulario");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // 🔴 CLAVE

    // Tomar valores
    const datos = {
      cliente: document.getElementById("cliente").value,
      fecha: document.getElementById("fecha").value,
      nombreEnsayo: document.getElementById("nombreEnsayo").value,
      propuesta: document.getElementById("propuesta").value,
      dosis: document.getElementById("dosis").value,
      elaboracion: document.getElementById("elaboracion").value,
      resultados: document.getElementById("resultados").value,
      fotos: document.getElementById("fotos").files
    };

    console.log("✅ Ensayo guardado:", datos);

    alert("Ensayo guardado correctamente (prueba)");

    // 👉 acá después volvemos a poner Firestore / redirect
  });

});
