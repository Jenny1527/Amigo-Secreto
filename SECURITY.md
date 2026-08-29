# 🔒 Seguridad — Amigo Secreto Liga de Superhéroes

Este documento describe las medidas de seguridad implementadas en la aplicación,
alineadas con el **OWASP Top 10 (2021)**.

---

## Arquitectura de Seguridad

### Modelo de acceso

| Rol | Puede hacer | No puede hacer |
|-----|-------------|----------------|
| **Anónimo** (cualquiera con el link) | Inscribirse (INSERT en `participants`), consultar héroes tomados, ver si hubo sorteo, consultar **su propio** resultado por celular | Leer la lista de participantes, eliminar registros, realizar sorteo, resetear datos |
| **Admin** (con contraseña) | Todo lo anterior + listar participantes, eliminar, sortear, resetear, exportar CSV | Cambiar la contraseña (se hace directo en la BD) |

### Flujo de datos

```
┌──────────────┐     INSERT (RLS permite)      ┌───────────────┐
│   Usuario    │ ──────────────────────────────►│  Supabase BD  │
│  (navegador) │     RPC + password             │  (PostgreSQL) │
│              │ ──────────────────────────────►│               │
└──────────────┘                                └───────────────┘
       │                                               │
       │  Solo lee: héroes tomados (RPC público),      │
       │  count (RPC público), draw_results (SELECT)   │
       │◄──────────────────────────────────────────────│
```

---

## OWASP Top 10 — Mitigaciones

### A01: Broken Access Control ✅
- **RLS (Row Level Security)** activado en todas las tablas.
- `participants`: anon solo puede `INSERT`. No puede `SELECT *`, `UPDATE`, ni `DELETE`.
- `draw_results`: anon solo puede `SELECT` (para consultar resultados).
- Operaciones de admin pasan por **funciones RPC** que validan un password del lado del servidor (`SECURITY DEFINER`).
- La lista de héroes tomados se obtiene vía RPC público (`public_taken_heroes`) que solo retorna IDs de héroes, sin datos personales.

### A02: Cryptographic Failures ✅
- El password de admin **no está en el código fuente** del frontend.
- Se valida del lado del servidor en funciones PostgreSQL.
- La anon key de Supabase es pública por diseño (solo otorga permisos `anon`).

### A03: Injection ✅
- Todos los inputs se **sanitizan** con `sanitizeInput()` antes de enviarse:
  - Recorte de longitud máxima.
  - Eliminación de caracteres de control y null bytes.
- Las preferencias se validan contra la lista conocida (allowlist).
- Los IDs de héroes se validan contra la lista `HEROES`.
- La API REST de Supabase usa parámetros preparados internamente.

### A04: Insecure Design ✅
- Separación clara de roles: anónimo vs. admin.
- El diseño asume que el repositorio es público y la anon key es visible.
- Los datos sensibles (celulares, nombres) solo son accesibles con password de admin.

### A05: Security Misconfiguration ✅
- Políticas RLS restrictivas (no `using (true) with check (true)` para todo).
- Se recomienda configurar headers de seguridad en el hosting:
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`

### A06: Vulnerable and Outdated Components ✅
- La app no usa frameworks ni paquetes npm. Es vanilla HTML/CSS/JS.
- Supabase se consume vía `fetch()` nativo.
- Sin dependencias externas que gestionar o actualizar.

### A07: Identification and Authentication Failures ✅
- **Rate limiting** en el frontend: 3 intentos de login → bloqueo 30 segundos.
- Validación de password en el servidor (no en el frontend).
- Sesión de admin almacenada en `sessionStorage` (expira al cerrar pestaña).

### A08: Software and Data Integrity Failures ✅
- El sorteo se ejecuta y guarda vía RPC server-side. Un atacante no puede manipular los resultados desde el frontend.
- Se recomienda agregar `integrity` (SRI) si se cargan scripts desde CDN en el futuro.

### A09: Security Logging and Monitoring ✅
- Los intentos de admin (login, operaciones) se ejecutan como funciones PostgreSQL, registrados en los logs de Supabase.
- Los logs están disponibles en: Dashboard → Settings → Database → Logs.

### A10: Server-Side Request Forgery (SSRF) ✅
- No aplica. La app no hace requests a URLs proporcionadas por el usuario.

---

## Configuración

### Cambiar el password de admin

Edita la función `admin_check_password` en la base de datos:

```sql
create or replace function admin_check_password(pwd text)
returns boolean
language plpgsql security definer
as $$
begin
  return pwd = 'TU_NUEVO_PASSWORD_AQUI';
end;
$$;
```

### Setup inicial (base nueva)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor → New query**
3. Pega el contenido de `supabase_setup.sql` y presiona **Run**
4. Actualiza `js/config.js` con tu URL y anon key

### Migración (base existente con versión anterior)

1. Ve a **SQL Editor → New query**
2. Pega el contenido de `supabase_migration.sql` y presiona **Run**
3. Esto renombra `cedula` → `celular` y reemplaza las políticas abiertas

---

## Limitaciones conocidas

1. **Password en PostgreSQL:** El password está en una función PostgreSQL (visible para quien tenga acceso al Dashboard de Supabase). Para mayor seguridad, se podría usar `vault.secrets` de Supabase o variables de entorno con Edge Functions.

2. **Rate limiting solo en frontend:** El rate limiting de login es del lado del cliente. Un atacante sofisticado podría saltarlo. Para producción crítica, implementar rate limiting del lado del servidor con Supabase Edge Functions o un proxy.

3. **Datos del sorteo en `draw_results`:** Los resultados del sorteo son legibles por `anon` (para que cada persona pueda consultar su resultado por celular). Esto significa que alguien que inspecione la respuesta de la API podría ver todos los emparejamientos. Para una dinámica de oficina, esto es aceptable. Para mayor seguridad, se podría crear un RPC que solo devuelva el resultado del celular solicitado.

4. **No hay HTTPS forzado:** Depende del hosting (GitHub Pages lo provee automáticamente).
