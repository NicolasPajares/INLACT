/*************************
 * FIREBASE
 *************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.appspot.com",
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/*************************
 * ELEMENTOS
 *************************/
const listaEl = document.getElementById("listaCotizaciones");
const buscadorEl = document.getElementById("buscadorCotizaciones");

const btnNuevaCotizacion =
  document.getElementById("btnNuevaCotizacion");

const btnListaPrecios =
  document.getElementById("btnListaPrecios");

let cotizaciones = [];

/*************************
 * BOTONES
 *************************/
btnNuevaCotizacion.addEventListener("click", () => {
  window.location.href = "nueva-cotizacion.html";
});

btnListaPrecios.addEventListener("click", () => {
  window.location.href = "lista-precios.html";
});

/*************************
 * CARGAR COTIZACIONES
 *************************/
async function cargarCotizaciones() {

  listaEl.innerHTML =
    "<li>Cargando cotizaciones...</li>";

  cotizaciones = [];

  try{

    const q = query(
      collection(db,"cotizaciones"),
      orderBy("fecha","desc")
    );

    const snap = await getDocs(q);

    snap.forEach(d=>{

      cotizaciones.push({
        id:d.id,
        ...d.data()
      });

    });

  }catch(e){

    console.log("Todavía no existe la colección cotizaciones.");

  }

  if(cotizaciones.length===0){

    listaEl.innerHTML=
    "<li>No hay cotizaciones cargadas</li>";

    return;

  }

  renderCotizaciones(cotizaciones);

}

/*************************
 * RENDER
 *************************/
function renderCotizaciones(lista){

  listaEl.innerHTML="";

  lista.forEach(c=>{

    const li=document.createElement("li");
    li.className="cliente-item";

    const fecha=c.fecha?.toDate
      ?c.fecha.toDate().toLocaleDateString("es-AR")
      :"--/--/----";

    const info=document.createElement("div");
    info.className="cliente-info";

    info.innerHTML=`
      <small>${fecha}</small>
      <strong>${c.clienteNombre || "Cliente sin nombre"}</strong>
      <small>${c.nombreCotizacion || "Cotización sin nombre"}</small>
    `;

    info.onclick=()=>{

      window.location.href=
      `cotizacion.html?id=${c.id}`;

    };

    const btn=document.createElement("button");

    btn.className="btn-borrar";
    btn.textContent="✖";

    btn.onclick=async(e)=>{

      e.stopPropagation();

      if(!confirm("¿Eliminar esta cotización?"))
        return;

      await deleteDoc(
        doc(db,"cotizaciones",c.id)
      );

      cargarCotizaciones();

    };

    li.appendChild(info);
    li.appendChild(btn);

    listaEl.appendChild(li);

  });

}

/*************************
 * BUSCADOR
 *************************/
buscadorEl.addEventListener("input",()=>{

  const texto=buscadorEl.value.toLowerCase();

  const filtrados=cotizaciones.filter(c=>

    (c.clienteNombre || "")
      .toLowerCase()
      .includes(texto)

    ||

    (c.nombreCotizacion || "")
      .toLowerCase()
      .includes(texto)

  );

  renderCotizaciones(filtrados);

});

/*************************
 * INIT
 *************************/
cargarCotizaciones();
