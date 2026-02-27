const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  alert("Ensayo no encontrado");
}

fetch(`https://firestore.googleapis.com/v1/projects/inlact/databases/(default)/documents/ensayos/${id}`)
  .then(res => res.json())
  .then(data => {
    const f = data.fields;

    document.getElementById("empresa").textContent = f.empresa?.stringValue || "";
    document.getElementById("fecha").textContent = f.fecha?.stringValue || "";
    document.getElementById("nombre-ensayo").textContent = f.ensayo?.stringValue || "";

    document.getElementById("txt-propuesta").textContent = f.propuesta?.stringValue || "";
    document.getElementById("txt-dosis").textContent = f.dosis?.stringValue || "";
    document.getElementById("txt-elaboracion").textContent = f.elaboracion?.stringValue || "";
    document.getElementById("txt-resultados").textContent = f.resultados?.stringValue || "";
    document.getElementById("txt-conclusion").textContent = f.conclusion?.stringValue || "";

    if (f.precio) {
      document.getElementById("txt-precio").textContent = f.precio.stringValue;
      document.getElementById("precio").style.display = "block";
      document.getElementById("link-precio").style.display = "block";
    }

    if (f.imagenes) {
      const galeria = document.getElementById("galeria");
      f.imagenes.arrayValue.values.forEach(item => {
        const img = document.createElement("img");
        img.src = item.stringValue;
        galeria.appendChild(img);
      });
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error cargando el ensayo");
  });
