# Comunidad Jóvenes en Acción · Grupos de WhatsApp

Plataforma comunitaria (Ecuador 2026) donde los beneficiarios del programa
**Jóvenes en Acción** comparten y descubren grupos de WhatsApp: pasantías,
trámites, estudio, empleo y ayuda mutua.

- **Visitantes** (sin cuenta): ven y entran a los grupos.
- **Usuarios registrados**: publican y gestionan sus propios grupos.

## Stack

| Área | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Estilos | Tailwind CSS v4 (diseño minimalista, claro/oscuro) |
| Iconos | lucide-react |
| Animaciones | framer-motion |
| Validación | Zod (cliente + servidor) |
| Backend | Supabase (Auth + Postgres + Storage) |
| Gestor | bun |

## Puesta en marcha

```bash
# 1. Instalar dependencias
bun install

# 2. Configurar variables de entorno
#    Copia .env.example a .env.local y rellena tus claves de Supabase
cp .env.example .env.local

# 3. Servidor de desarrollo
bun run dev        # http://localhost:3000

# Producción
bun run build && bun run start
```

### Variables de entorno (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # secreto, solo servidor (opcional)
```

> La app arranca aunque falten las claves: muestra un aviso de configuración
> en lugar de romperse.

## Categorías (ministerios)

Los grupos se filtran por la institución donde se realiza la pasantía:

- Ministerio de Infraestructura y Transporte
- Ministerio de Salud Pública
- Ministerio de Educación, Deporte y Cultura
- Secretaría Nacional de Gestión de Riesgos
- General / Otros

## Moderación (flujo de aprobación)

- Al publicar, el grupo queda en estado **`pending`** y NO aparece en la home.
- El **administrador** revisa en `/admin` y **aprueba** o **rechaza**.
- Solo los grupos **`approved`** son visibles públicamente (garantizado por RLS).
- Administradores: fila en la tabla `admins` (por correo). Para añadir otro:
  `insert into admins (email) values ('correo@ejemplo.com');`

## Base de datos (ya configurada en Supabase)

- Tabla `groups` con validación a nivel de BD, columna `status` e índices.
- **Row Level Security**:
  - Lectura pública solo de grupos aprobados.
  - Escritura solo del dueño autenticado (siempre en estado `pending`).
  - El admin (función `is_admin()`) ve todo y puede aprobar/rechazar/borrar.
- Anti-spam: máximo 15 grupos por usuario y enlaces de WhatsApp únicos.
- Bucket `group-images` (público, máx 2 MB, solo imágenes, carpeta por usuario).

### Autenticación por correo

Por defecto Supabase pide confirmar el correo al registrarse. Para pruebas
rápidas puedes desactivarlo en el Dashboard:
**Authentication → Providers → Email → "Confirm email" (off)**.

## Seguridad y rendimiento

- **Rate limiting por capas** (`src/lib/ratelimit.ts` + `src/proxy.ts`):
  - Autenticación: 5 intentos/min por IP (anti fuerza bruta).
  - Escrituras: 20/min por IP.
  - Navegación global: 120/min por IP (anti flood/scraping) → responde `429`.
- **Cabeceras de seguridad** en `proxy.ts` y `next.config.ts`
  (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`).
- **Protección de rutas**: `/dashboard` exige sesión activa.
- **Caché**: la home revalida cada 30 s para no saturar la base de datos.
- Validación doble (Zod en cliente y servidor) + RLS como última línea.

## Estructura

```
src/
├── app/
│   ├── page.tsx            # Home: hero + grid de grupos
│   ├── login/ register/    # Autenticación
│   ├── dashboard/          # Panel privado (crear/gestionar grupos)
│   └── auth/actions.ts     # Server actions de login/registro/logout
├── components/             # Navbar, Footer, GroupCard, GroupGrid, GroupForm…
├── lib/
│   ├── supabase/           # Clientes browser/server/proxy + config
│   ├── ratelimit.ts        # Limitador en memoria
│   ├── validation.ts       # Esquemas Zod
│   └── types.ts            # Tipos y categorías
└── proxy.ts                # Middleware: rate limit + sesión + seguridad
```

## Escalar el rate limiting

El limitador es en memoria (por instancia), ideal para empezar. Para
despliegues con muchas instancias, migra a **Upstash Redis** manteniendo la
misma firma de `rateLimit()`.
