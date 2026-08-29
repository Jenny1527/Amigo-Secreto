# 🧪 Pruebas Funcionales — Amigo Secreto Liga de Superhéroes

**Estado:** ✅ Actualizado con hardening de seguridad OWASP y migración cédula→celular.
**Última actualización:** 28 de agosto de 2026.
Leyenda: ✅ pasa · ❌ falla · ⚠️ observación.

> **Nota:** la app ya está en **modo compartido** (Supabase). Las operaciones de admin ahora pasan por funciones RPC server-side que validan un password. La anon key solo permite INSERT en participants y SELECT en draw_results.

## 🔧 Cambios recientes
- ✅ **Seguridad OWASP Top 10:** Políticas RLS restrictivas, password de admin validado server-side, sanitización de inputs, rate limiting.
- ✅ **Cédula → Celular:** El campo de identificación ahora es el número de celular.
- ✅ **Datos protegidos:** La lista de participantes (con celulares y nombres) solo es accesible con password de admin (vía RPC).
- ✅ **Estadísticas públicas:** La home page muestra conteo de inscritos y héroes disponibles sin exponer datos personales.

---

## A. Inscripción — validaciones de campos
- [ ] ✅ Formulario vacío → muestra errores y no guarda.
- [ ] ✅ Celular vacío o < 7 dígitos → error.
- [ ] ✅ Celular > 15 dígitos → error.
- [ ] ✅ Celular con espacios o guiones → los acepta y normaliza.
- [ ] ✅ Nombre vacío → error.
- [ ] ✅ Nombre con < 2 caracteres → error.
- [ ] ✅ Cargo vacío → error.
- [ ] ✅ Sin héroe → error "Debes seleccionar un superhéroe".
- [ ] ✅ Regalo vacío → error en ese regalo.
- [ ] ✅ Sin preferencia de endulzada → error.
- [ ] ✅ "Otros" sin detalle → error (obligatorio).
- [ ] ✅ "Otros" con detalle → lo acepta.
- [ ] ✅ Dulce/Salado/Ambos + detalle escrito → lo guarda.
- [ ] ✅ Alergias vacío → permitido (opcional).
- [ ] ✅ Alergia escrita ("Maní") → la guarda.
- [ ] ✅ Sin compromiso de accesorio → error "Selecciona una opción".
- [ ] ✅ Formulario correcto → animación "¡POW!" y redirige al inicio.

## B. Duplicados de héroe
- [ ] ✅ Héroe ya inscrito aparece con ✗ y no se puede seleccionar.
- [ ] ✅ Forzar envío con héroe tomado → error y refresca la grilla.
- [ ] ✅ El contador "Héroes Disponibles" baja correctamente.

## C. Re-inscripción (mismo celular)
- [ ] ✅ Mismo celular otra vez → "Este celular ya está registrado" y no duplica.
- [ ] ✅ Mismo celular con/sin espacios → la detecta como la misma persona.
- [ ] ✅ El número de "Inscritos" no aumenta con el intento repetido.

## D. Multi-dispositivo y selección simultánea
- [ ] ✅ Dos navegadores distintos → ambos ven héroes disponibles (vía RPC público).
- [ ] ✅ Tomar un héroe en A → en B queda marcado como no disponible.
- [ ] ✅ Dos personas eligen el mismo héroe a la vez → solo uno queda; al otro se le avisa.
- [ ] ✅ Un celular ya inscrito no puede volver a inscribirse desde otro equipo.
- ⚠️ Nota: seleccionar (hacer clic) un héroe siempre está permitido; el bloqueo real ocurre al enviar.

## E. Sorteo (panel de admin)
- [ ] ✅ Con menos de 3 participantes → avisa "Se necesitan al menos 3".
- [ ] ✅ Con 3 o más → realiza el sorteo con animación.
- [ ] ✅ Nadie se sortea a sí mismo.
- [ ] ✅ No hay dos personas asignadas al mismo receptor.
- [ ] ✅ Volver a sortear → pide confirmación y reemplaza el anterior.
- [ ] ✅ Eliminar un participante después del sorteo → el sorteo se limpia.

## F. Resultados (consulta por celular)
- [ ] ✅ Antes del sorteo → "El sorteo aún no se ha realizado".
- [ ] ✅ Celular no inscrito → "No encontramos ese celular".
- [ ] ✅ Celular válido → muestra héroe, 3 regalos y datos del amigo secreto.
- [ ] ✅ Muestra la endulzada (Dulce/Salado/Ambos/Otros con detalle).
- [ ] ✅ Muestra alergias resaltadas (⚠️) o "No reportó alergias".
- [ ] ✅ Aclara que el regalo no tiene que ser de la temática.
- [ ] ✅ Fechas: endulzadas 4 y 11 de sept, entrega 18 de sept 2:00 p. m. cafetería.
- [ ] ✅ Botón "Volver a buscar" funciona.

## G. Panel de administración
- [ ] ✅ Contraseña incorrecta → "Contraseña incorrecta".
- [ ] ✅ 3 contraseñas incorrectas seguidas → bloqueo 30 segundos (rate limiting).
- [ ] ✅ Contraseña correcta → entra al panel (validada server-side vía RPC).
- [ ] ✅ Tabla con columnas: Celular, Nombre, Cargo, Superhéroe, Regalos, Endulzada, Alergias, Accesorio.
- [ ] ✅ Eliminar participante → pide confirmación y lo quita (vía RPC con password).
- [ ] ✅ Exportar CSV → descarga y abre bien en Excel (tildes correctas por BOM UTF-8).
- [ ] ✅ El CSV incluye Endulzada y Alergias.
- [ ] ✅ "Reiniciar Todo" → pide confirmación y borra todo (vía RPC con password).

## H. Contenido y textos
- [ ] ✅ Presupuesto $50.000 y aclaración de que el regalo no es de la temática.
- [ ] ✅ "¿Cómo funciona?" menciona las 2 endulzadas y la entrega del 18 de sept 2:00 p. m.
- [ ] ✅ La sección de endulzadas explica la caja de la cafetería.
- [ ] ✅ Todos los textos dicen "celular" (no "cédula").

## I. Persistencia y navegación
- [ ] ✅ Inscribir y recargar → el participante sigue (guardado en la nube).
- [ ] ✅ Cerrar y reabrir el navegador → los datos siguen.
- [ ] ✅ El menú (☰) funciona en pantalla angosta.
- [ ] ✅ La app se ve bien en celular (responsive).

## J. Seguridad (OWASP Top 10)
- [ ] ✅ **A01 Broken Access Control:** `SELECT * FROM participants` directo vía API REST **no** devuelve datos (RLS bloquea).
- [ ] ✅ **A02 Cryptographic Failures:** El password de admin no está en el código fuente del frontend.
- [ ] ✅ **A03 Injection:** Inputs sanitizados — caracteres de control eliminados, longitud limitada, hero IDs validados contra lista.
- [ ] ✅ **A04 Insecure Design:** Roles separados (anónimo vs admin), datos sensibles protegidos.
- [ ] ✅ **A05 Security Misconfiguration:** Políticas RLS restrictivas (no "allow all").
- [ ] ✅ **A07 Authentication Failures:** Login con rate limiting (3 intentos → 30s cooldown), validación server-side.
- [ ] ✅ **A08 Data Integrity:** Sorteo ejecutado y guardado vía RPC (no manipulable desde frontend).
- [ ] ✅ `<b>` o `<script>` en un campo → se muestra como texto plano (escapeHtml).
- [ ] ✅ Dos participantes con el mismo nombre pero distinto celular → ambos se registran.

---

### Pasos de configuración
1. **Ejecutar SQL:** Pegar `supabase_setup.sql` (base nueva) o `supabase_migration.sql` (base existente) en el SQL Editor de Supabase.
2. **Verificar RLS:** Confirmar que las políticas aparecen en Authentication → Policies.
3. **Verificar RPC:** Confirmar que las funciones aparecen en Database → Functions.
4. **Cambiar password (opcional):** Editar la función `admin_check_password` en el SQL Editor.
