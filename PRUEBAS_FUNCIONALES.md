# 🧪 Pruebas Funcionales — Amigo Secreto Liga de Superhéroes

**Estado:** ✅ Validado con la base de datos compartida (Supabase) conectada.
**Última validación:** 28 de agosto de 2026.
Leyenda: ✅ pasa · ❌ falla · ⚠️ observación.

> **Nota:** la app ya está en **modo compartido** (Supabase). Las pruebas de multi-dispositivo y selección simultánea (sección D) **ahora pasan**: se verificaron en vivo contra la base de datos real.

## 🔧 Correcciones recientes
- ✅ **Parpadeo de estadísticas:** el inicio mostraba "18 héroes" por un instante. Ahora muestra "…" mientras carga y luego el número real.
- ✅ **Lista de héroes en tiempo real:** la grilla de inscripción se **actualiza sola** cada pocos segundos y marca los héroes que otros acaban de tomar, sin recargar. Si el héroe que tenías seleccionado lo toma otra persona, te avisa y lo libera.
- ✅ **Duplicados imposibles:** la base de datos rechaza de forma atómica un héroe o una cédula repetidos (probado en vivo: el 2.º intento devuelve error).

---

## A. Inscripción — validaciones de campos
- [x] ✅ Formulario vacío → muestra errores y no guarda.
- [x] ✅ Cédula vacía o < 5 dígitos → error.
- [x] ✅ Cédula > 12 dígitos → error.
- [x] ✅ Cédula con puntos (1.023.456.789) → la acepta y normaliza.
- [x] ✅ Nombre vacío → error.
- [x] ✅ Cargo vacío → error.
- [x] ✅ Sin héroe → error "Debes seleccionar un superhéroe".
- [x] ✅ Regalo vacío → error en ese regalo.
- [x] ✅ Sin preferencia de endulzada → error.
- [x] ✅ "Otros" sin detalle → error (obligatorio).
- [x] ✅ "Otros" con detalle → lo acepta.
- [x] ✅ Dulce/Salado/Ambos + detalle escrito → lo guarda.
- [x] ✅ Alergias vacío → permitido (opcional).
- [x] ✅ Alergia escrita ("Maní") → la guarda.
- [x] ✅ Sin compromiso de accesorio → error "Selecciona una opción".
- [x] ✅ Formulario correcto → animación "¡POW!" y redirige al inicio.

## B. Duplicados de héroe (mismo navegador)
- [x] ✅ Héroe ya inscrito aparece con ✗ y no se puede seleccionar.
- [x] ✅ Forzar envío con héroe tomado → error y refresca la grilla.
- [x] ✅ El contador "Héroes Disponibles" baja correctamente.

## C. Re-inscripción (misma cédula)
- [x] ✅ Misma cédula otra vez → "Esta cédula ya está registrada" y no duplica.
- [x] ✅ Misma cédula con/sin puntos → la detecta como la misma persona.
- [x] ✅ El número de "Inscritos" no aumenta con el intento repetido.

## D. Multi-dispositivo y selección simultánea ✅ (validado en vivo)
- [x] ✅ Dos navegadores distintos → ambos ven la misma lista (base compartida).
- [x] ✅ Tomar un héroe en A → en B queda marcado como no disponible (se actualiza solo, sin recargar).
- [x] ✅ Dos personas eligen el mismo héroe casi a la vez → **solo uno queda**; al otro se le avisa "ese héroe acaba de ser tomado" y elige otro. *(Probado: 2.º intento rechazado por la BD, error 409.)*
- [x] ✅ Una cédula ya inscrita no puede volver a inscribirse desde otro equipo. *(Probado en vivo: rechazado por la BD.)*
- ⚠️ Nota: **seleccionar** (hacer clic) un héroe que se ve libre siempre está permitido; el bloqueo real ocurre al **enviar** la inscripción. El auto-refresh reduce mucho la posibilidad de elegir uno ya tomado.

## E. Sorteo (panel de admin)
- [x] ✅ Con menos de 3 participantes → avisa "Se necesitan al menos 3".
- [x] ✅ Con 3 o más → realiza el sorteo con animación.
- [x] ✅ Nadie se sortea a sí mismo. *(Algoritmo de derangement verificado.)*
- [x] ✅ No hay dos personas asignadas al mismo receptor.
- [x] ✅ Volver a sortear → pide confirmación y reemplaza el anterior.
- [x] ✅ Eliminar un participante después del sorteo → el sorteo se limpia.

## F. Resultados (consulta por cédula)
- [x] ✅ Antes del sorteo → "El sorteo aún no se ha realizado".
- [x] ✅ Cédula no inscrita → "No encontramos esa cédula".
- [x] ✅ Cédula válida → muestra héroe, 3 regalos y datos del amigo secreto.
- [x] ✅ Muestra la endulzada (Dulce/Salado/Ambos/Otros con detalle).
- [x] ✅ Muestra alergias resaltadas (⚠️) o "No reportó alergias".
- [x] ✅ Aclara que el regalo no tiene que ser de la temática.
- [x] ✅ Fechas: endulzadas 4 y 11 de sept, entrega 18 de sept 2:00 p. m. cafetería.
- [x] ✅ Botón "Volver a buscar" funciona.

## G. Panel de administración
- [x] ✅ Contraseña incorrecta → "Contraseña incorrecta".
- [x] ✅ Contraseña correcta (`superhero2026`) → entra al panel.
- [x] ✅ Tabla con columnas: Cédula, Nombre, Cargo, Superhéroe, Regalos, Endulzada, Alergias, Accesorio.
- [x] ✅ Eliminar participante → pide confirmación y lo quita.
- [x] ✅ Exportar CSV → descarga y abre bien en Excel (tildes correctas por BOM UTF-8).
- [x] ✅ El CSV incluye Endulzada y Alergias.
- [x] ✅ "Reiniciar Todo" → pide confirmación y borra participantes y sorteo.

## H. Contenido y textos
- [x] ✅ Presupuesto $50.000 y aclaración de que el regalo no es de la temática.
- [x] ✅ "¿Cómo funciona?" menciona las 2 endulzadas y la entrega del 18 de sept 2:00 p. m.
- [x] ✅ La sección de endulzadas explica la caja de la cafetería.

## I. Persistencia y navegación
- [x] ✅ Inscribir y recargar → el participante sigue (ahora guardado en la nube).
- [x] ✅ Cerrar y reabrir el navegador → los datos siguen (y se ven desde cualquier equipo).
- [x] ✅ El menú (☰) funciona en pantalla angosta.
- [x] ✅ La app se ve bien en celular (responsive).

## J. Casos borde / seguridad
- [x] ✅ Tildes y ñ ("Muñoz", "café") → se muestran correctamente.
- [x] ✅ Nombre muy largo → la tabla tiene scroll horizontal, no rompe el diseño.
- [x] ✅ `<b>` o `<script>` en un campo → se muestra como texto plano, no se ejecuta (se escapa el HTML).
- [x] ✅ Dos participantes con el mismo nombre pero distinta cédula → ambos se registran.

---

### Pendientes sugeridos (no son fallas)
1. **Borrar los datos de prueba** actuales (4 inscripciones de prueba) con **Admin → Reiniciar Todo** antes de abrir la dinámica al equipo.
2. **Publicar la app con un link** (hosting gratis) para que cada persona se inscriba desde su propio celular/computador — ahí se aprovecha del todo el modo compartido.
