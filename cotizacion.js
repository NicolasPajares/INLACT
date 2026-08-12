/* ============================================================
   COTIZACIÓN INLACT
============================================================ */


/* ============================================================
   FIREBASE
============================================================ */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* ============================================================
   CONFIGURACIÓN FIREBASE
============================================================ */

const firebaseConfig = {

  apiKey:
    "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",

  authDomain:
    "inlact.firebaseapp.com",

  projectId:
    "inlact",

  storageBucket:
    "inlact.firebasestorage.app",

  messagingSenderId:
    "143868382036",

  appId:
    "1:143868382036:web:b5af0e4faced7e880216c1"

};


const app =
  initializeApp(firebaseConfig);


const db =
  getFirestore(app);


/* ============================================================
   ELEMENTOS
============================================================ */

const empresaEl =
  document.getElementById(
    "empresa"
  );


const fechaEl =
  document.getElementById(
    "fecha"
  );


const nombreCotizacionEl =
  document.getElementById(
    "nombre-cotizacion"
  );


const clienteEl =
  document.getElementById(
    "cliente"
  );


const propuestaEl =
  document.getElementById(
    "contenido-propuesta"
  );


const dosisEl =
  document.getElementById(
    "contenido-dosis"
  );


const listaProductosEl =
  document.getElementById(
    "lista-productos-cotizacion"
  );


const totalEl =
  document.getElementById(
    "total-cotizacion"
  );


const observacionesEl =
  document.getElementById(
    "contenido-observaciones"
  );


/* ============================================================
   OBTENER ID DE LA COTIZACIÓN
============================================================ */

function obtenerIdCotizacion() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  return parametros.get("id");

}


/* ============================================================
   FORMATEAR FECHA
============================================================ */

function formatearFecha(fecha) {

  if (!fecha) {

    return "";

  }


  let fechaReal;


  /*
   * Firebase Timestamp
   */

  if (
    typeof fecha.toDate === "function"
  ) {

    fechaReal =
      fecha.toDate();

  }


  /*
   * Date
   */

  else if (
    fecha instanceof Date
  ) {

    fechaReal =
      fecha;

  }


  /*
   * String
   */

  else if (
    typeof fecha === "string"
  ) {

    fechaReal =
      new Date(fecha);

  }


  if (
    !fechaReal ||
    Number.isNaN(
      fechaReal.getTime()
    )
  ) {

    return "";

  }


  return fechaReal.toLocaleDateString(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


/* ============================================================
   FORMATEAR PRECIO
============================================================ */

function formatearPrecio(
  precio,
  moneda
) {

  const valor =
    Number(precio || 0);


  const simbolo =
    moneda === "USD"
      ? "USD "
      : moneda === "EUR"
        ? "EUR "
        : "$ ";


  return (
    simbolo +
    valor.toLocaleString(
      "es-AR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )
  );

}


/* ============================================================
   MOSTRAR TEXTO
============================================================ */

function mostrarTexto(
  elemento,
  texto
) {

  if (!elemento) {

    return;

  }


  elemento.textContent =
    texto || "";

}


/* ============================================================
   CARGAR COTIZACIÓN
============================================================ */

async function cargarCotizacion() {

  try {

    const id =
      obtenerIdCotizacion();


    /*
     * No hay ID
     */

    if (!id) {

      mostrarError(
        "No se encontró el identificador de la cotización."
      );

      return;

    }


    /*
     * Buscar documento
     */

    const referencia =
      doc(
        db,
        "cotizaciones",
        id
      );


    const snap =
      await getDoc(
        referencia
      );


    /*
     * No existe
     */

    if (!snap.exists()) {

      mostrarError(
        "La cotización no existe o fue eliminada."
      );

      return;

    }


    /*
     * Datos
     */

    const cotizacion =
      snap.data();


    console.log(
      "Cotización cargada:",
      cotizacion
    );


    /*
     * PORTADA
     */

    cargarPortada(
      cotizacion
    );


    /*
     * PROPUESTA
     */

    cargarPropuesta(
      cotizacion
    );


    /*
     * DOSIS
     */

    cargarDosis(
      cotizacion
    );


    /*
     * PRODUCTOS
     */

    cargarProductos(
      cotizacion
    );


    /*
     * OBSERVACIONES
     */

    cargarObservaciones(
      cotizacion
    );


  }

  catch (error) {

    console.error(
      "Error cargando cotización:",
      error
    );


    mostrarError(
      "No se pudo cargar la cotización."
    );

  }

}


/* ============================================================
   CARGAR PORTADA
============================================================ */

function cargarPortada(
    cotizacion
) {

    /*
     * Empresa / Cliente
     */

    if (empresaEl) {

        empresaEl.textContent =
            cotizacion.clienteNombre ||
            "Cliente sin nombre";

    }


    /*
     * Fecha
     */

    if (fechaEl) {

        fechaEl.textContent =
            formatearFecha(
                cotizacion.fecha
            );

    }


    /*
     * Nombre de la cotización
     */

    if (nombreCotizacionEl) {

        nombreCotizacionEl.textContent =
            cotizacion.nombreCotizacion ||
            "Cotización";

    }

}

/* ============================================================
   PROPUESTA
============================================================ */

function cargarPropuesta(
  cotizacion
) {

  mostrarTexto(
    propuestaEl,
    cotizacion.propuesta
  );

}


/* ============================================================
   DOSIS
============================================================ */

function cargarDosis(
  cotizacion
) {

  mostrarTexto(
    dosisEl,
    cotizacion.dosis
  );

}


/* ============================================================
   OBSERVACIONES
============================================================ */

function cargarObservaciones(
  cotizacion
) {

  mostrarTexto(
    observacionesEl,
    cotizacion.observaciones
  );

}


/* ============================================================
   CARGAR PRODUCTOS
============================================================ */

function cargarProductos(
  cotizacion
) {

  if (!listaProductosEl) {

    return;

  }


  listaProductosEl.innerHTML =
    "";


  const productos =
    Array.isArray(
      cotizacion.productos
    )
      ? cotizacion.productos
      : [];


  /*
   * Sin productos
   */

  if (
    productos.length === 0
  ) {

    if (totalEl) {

      totalEl.textContent =
        "";

    }

    return;

  }


  /*
   * CABECERA
   */

  const cabecera =
    document.createElement(
      "div"
    );


  cabecera.className =
    "cabecera-productos-cotizacion";


  cabecera.innerHTML = `

    <span>
      Producto
    </span>

    <span>
      Unidad
    </span>

    <span>
      Moneda
    </span>

    <span>
      Precio
    </span>

  `;


  listaProductosEl.appendChild(
    cabecera
  );


  /*
   * Totales por moneda
   *
   * No mezclamos USD, EUR y ARS.
   */

  const totales = {};


  /*
   * PRODUCTOS
   */

  productos.forEach(
    producto => {

      const tarjeta =
        document.createElement(
          "div"
        );


      tarjeta.className =
        "producto-cotizacion";


      const nombre =
        producto.nombre ||
        producto.descripcion ||
        "Producto sin nombre";


      const unidad =
        producto.unidad ||
        "-";


      const moneda =
        producto.moneda ||
        "ARS";


      const precio =
        Number(
          producto.precioUnitario ||
          0
        );


      tarjeta.innerHTML = `

        <div class="producto-nombre">
          ${escaparHTML(nombre)}
        </div>

        <div class="producto-unidad">
          ${escaparHTML(unidad)}
        </div>

        <div class="producto-moneda">
          ${escaparHTML(moneda)}
        </div>

        <div class="producto-precio">
          ${formatearPrecio(
            precio,
            moneda
          )}
        </div>

      `;


      listaProductosEl.appendChild(
        tarjeta
      );


      /*
       * Acumular total
       */

      if (
        !totales[moneda]
      ) {

        totales[moneda] =
          0;

      }


      totales[moneda] +=
        precio;

    }
  );


  /*
   * MOSTRAR TOTALES
   */

  mostrarTotales(
    totales
  );

}




/* ============================================================
   ESCAPAR HTML
============================================================ */

function escaparHTML(
  texto
) {

  return String(
    texto || ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* ============================================================
   MOSTRAR ERROR
============================================================ */

function mostrarError(
  mensaje
) {

  const contenido =
    document.querySelector(
      ".contenido-blanco-cotizacion"
    );


  if (!contenido) {

    return;

  }


  contenido.innerHTML = `

    <div
      style="
        padding:40px;
        text-align:center;
        color:#b91c1c;
      "
    >

      <h2>
        No se pudo cargar la cotización
      </h2>

      <p>
        ${escaparHTML(mensaje)}
      </p>

    </div>

  `;

}


/* ============================================================
   MENÚ LATERAL
============================================================ */

function configurarMenu() {

  const botones =
    document.querySelectorAll(
      ".menu-cotizacion button"
    );


  botones.forEach(
    boton => {

      boton.addEventListener(
        "click",
        () => {

          const id =
            boton.dataset.seccion;


          const seccion =
            document.getElementById(
              id
            );


          if (!seccion) {

            return;

          }


          seccion.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });


          /*
           * Marcar botón activo
           */

          botones.forEach(
            b =>
              b.classList.remove(
                "activo"
              )
          );


          boton.classList.add(
            "activo"
          );

        }
      );

    }
  );

}


/* ============================================================
   INICIO
============================================================ */

async function iniciar() {

  configurarMenu();

  await cargarCotizacion();

}


/* ============================================================
   EJECUTAR
============================================================ */

iniciar();
