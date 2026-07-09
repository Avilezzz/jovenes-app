import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getClientIp, rateLimit } from "@/lib/ratelimit";

// Cabeceras de seguridad aplicadas a todas las respuestas.
function applySecurityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  res.headers.set("X-DNS-Prefetch-Control", "on");
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request.headers);
  const isMutation = request.method !== "GET" && request.method !== "HEAD";
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // --- Rate limiting por capas para evitar saturación del servidor ---
  // 1) Rutas de autenticación: muy estrictas (anti fuerza bruta).
  if (isAuthRoute && isMutation) {
    const rl = rateLimit(`auth:${ip}`, 5, 60_000); // 5 intentos / min
    if (!rl.success) return tooMany(rl.retryAfter);
  }

  // 2) Cualquier mutación (crear/borrar grupos, formularios).
  if (isMutation) {
    const rl = rateLimit(`write:${ip}`, 20, 60_000); // 20 escrituras / min
    if (!rl.success) return tooMany(rl.retryAfter);
  }

  // 3) Límite global de navegación por IP (anti-scraping / flood).
  const globalRl = rateLimit(`global:${ip}`, 120, 60_000); // 120 req / min
  if (!globalRl.success) return tooMany(globalRl.retryAfter);

  // --- Refresco de sesión de Supabase ---
  const { response, user } = await updateSession(request);

  // --- Protección de rutas privadas ---
  const isPrivate =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  if (isPrivate && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Si ya está logueado, no mostramos login/registro.
  if (isAuthRoute && user && !isMutation) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Copiamos las cookies de sesión a la respuesta con cabeceras de seguridad.
  const finalResponse = applySecurityHeaders(NextResponse.next({ request }));
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie);
  });
  return finalResponse;
}

function tooMany(retryAfter: number) {
  return new NextResponse(
    JSON.stringify({
      error: "Demasiadas solicitudes. Intenta de nuevo en un momento.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    },
  );
}

export const config = {
  // Ejecuta el middleware en todo excepto assets estáticos.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|banner.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
