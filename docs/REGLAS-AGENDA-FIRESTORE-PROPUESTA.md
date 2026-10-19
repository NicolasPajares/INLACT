# Propuesta de reglas Firestore para la agenda INLACT

**Estado: propuesta para revisión. No desplegada en Firebase.**

Este archivo documenta únicamente las reglas para la colección `agenda_actividades`. No reemplaza las reglas actuales de INLACT. Antes de habilitar el uso real, hay que insertar el bloque dentro del `service cloud.firestore`, antes del bloqueo final `match /{document=**}`, y probarlo con el simulador de reglas.

## Comportamiento previsto

- Un integrante con perfil válido puede leer solo sus actividades.
- El administrador puede leer todas las actividades para supervisar al equipo.
- Cada integrante puede crear, modificar y eliminar solo actividades asignadas a su propio UID.
- El administrador puede gestionar sus propias actividades, pero no modificar ni borrar las de otros integrantes.
- El responsable y los datos de creación no se pueden cambiar durante una edición.
- Se validan los campos permitidos, los valores de prioridad/estado y las marcas de tiempo.
- Estas reglas no cambian los permisos de ninguna otra colección.

## Bloque propuesto

Agregar este bloque dentro de `match /databases/{database}/documents {` y antes del bloqueo final general:

```javascript
    // AGENDA PERSONAL: cada integrante administra sus propias actividades.
    match /agenda_actividades/{id} {

      // El administrador puede consultar todas; cada integrante solo las propias.
      allow read: if isAdmin()
        || (
          hasProfile()
          && resource.data.responsableUid == request.auth.uid
        );

      // Crear una actividad asignada al usuario autenticado.
      allow create: if hasProfile()
        && request.resource.data.keys().hasOnly([
          "titulo", "descripcion", "fecha", "prioridad", "estado",
          "responsableUid", "responsableNombre", "actualizadoEn",
          "completadoEn", "creadoPorUid", "creadoEn"
        ])
        && request.resource.data.keys().hasAll([
          "titulo", "descripcion", "fecha", "prioridad", "estado",
          "responsableUid", "responsableNombre", "actualizadoEn",
          "completadoEn", "creadoPorUid", "creadoEn"
        ])
        && request.resource.data.responsableUid == request.auth.uid
        && request.resource.data.creadoPorUid == request.auth.uid
        && request.resource.data.titulo is string
        && request.resource.data.titulo.size() > 0
        && request.resource.data.titulo.size() <= 120
        && request.resource.data.descripcion is string
        && request.resource.data.descripcion.size() <= 2000
        && request.resource.data.fecha is string
        && request.resource.data.prioridad in ["alta", "media", "baja"]
        && request.resource.data.estado in ["pendiente", "en_curso", "realizada"]
        && request.resource.data.responsableNombre is string
        && request.resource.data.responsableNombre.size() <= 120
        && request.resource.data.actualizadoEn == request.time
        && request.resource.data.creadoEn == request.time
        && (
          (request.resource.data.estado == "realizada"
            && request.resource.data.completadoEn == request.time)
          || (request.resource.data.estado != "realizada"
            && request.resource.data.completadoEn == null)
        );

      // Editar solo una actividad propia, sin cambiar su responsable ni su creación.
      allow update: if hasProfile()
        && resource.data.responsableUid == request.auth.uid
        && request.resource.data.responsableUid == resource.data.responsableUid
        && request.resource.data.responsableNombre == resource.data.responsableNombre
        && request.resource.data.creadoPorUid == resource.data.creadoPorUid
        && request.resource.data.creadoEn == resource.data.creadoEn
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
          "titulo", "descripcion", "fecha", "prioridad",
          "estado", "actualizadoEn", "completadoEn"
        ])
        && request.resource.data.titulo is string
        && request.resource.data.titulo.size() > 0
        && request.resource.data.titulo.size() <= 120
        && request.resource.data.descripcion is string
        && request.resource.data.descripcion.size() <= 2000
        && request.resource.data.fecha is string
        && request.resource.data.prioridad in ["alta", "media", "baja"]
        && request.resource.data.estado in ["pendiente", "en_curso", "realizada"]
        && request.resource.data.actualizadoEn == request.time
        && (
          (request.resource.data.estado == "realizada"
            && request.resource.data.completadoEn != null)
          || (request.resource.data.estado != "realizada"
            && request.resource.data.completadoEn == null)
        );

      // Borrar solo actividades propias.
      allow delete: if hasProfile()
        && resource.data.responsableUid == request.auth.uid;
    }
```

## Pruebas necesarias antes de desplegar

1. Usuario regular A puede crear, listar, editar y borrar sus propias actividades.
2. Usuario regular A no puede leer, editar ni borrar una actividad de B.
3. Usuario regular A no puede crear una actividad asignada a B ni cambiar el responsable de una actividad existente.
4. El administrador puede listar todas las actividades y filtrar por integrante.
5. El administrador no puede editar ni borrar una actividad que pertenece a otro integrante.
6. El administrador puede gestionar una actividad propia.
7. Usuarios sin sesión o sin documento válido en `usuarios/{uid}` no pueden acceder.
8. Las colecciones actuales (clientes, ensayos, cotizaciones, publicaciones públicas, stock, etc.) mantienen sus permisos actuales.

## Observaciones

- Las reglas de Firestore no son filtros: las consultas de usuarios regulares deben incluir `where("responsableUid", "==", perfil.uid)`. La pantalla de agenda ya realiza esa consulta; el administrador consulta la colección completa.
- El código de la agenda y este bloque deben mantenerse sincronizados si cambian nombres de campos o estados.
- La prueba debe hacerse con el simulador de reglas y cuentas de prueba antes de pegar el bloque en las reglas activas. No se modificaron las reglas de Firebase al crear este documento.
