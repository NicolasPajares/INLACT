# Agenda personal INLACT — rama de prueba

Rama: `feature/agenda-personal-admin`

## Diseño inicial
- Cada integrante ve y gestiona sus propias actividades.
- El administrador puede consultar las actividades de todo el equipo y filtrar por integrante.
- Los usuarios normales no pueden editar ni borrar actividades de otra persona desde la interfaz.
- Campos: título, descripción, fecha, prioridad y estado.
- Estados: pendiente, en curso y realizada.
- Las tareas vencidas se destacan visualmente.
- No se incluyeron notificaciones ni alertas automáticas en esta primera versión.

## Dependencia pendiente antes de usar con datos reales
La pantalla usa la colección `agenda_actividades`. Las reglas de Firestore deben autorizarla expresamente, dado que las reglas actuales del repositorio bloquean por defecto las colecciones no declaradas. Por indicación del usuario, esta rama no modifica reglas de Firestore ni despliega cambios a producción.

Reglas mínimas a diseñar y probar antes de habilitar el uso real:
- Solo usuarios con perfil válido pueden acceder.
- Un usuario puede leer sus actividades con consulta por `responsableUid == request.auth.uid`.
- Un usuario solo puede crear, modificar y eliminar actividades propias.
- El administrador puede leer todas las actividades para supervisión.
- La identidad del responsable y los campos de auditoría deben protegerse contra suplantación.

No desplegar ni fusionar a `main` hasta revisar la pantalla y aprobar las reglas específicas.
