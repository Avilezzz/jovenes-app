// Rate limiter en memoria (ventana deslizante) para proteger el servidor
// de abuso y saturación, sin depender de servicios externos.
//
// Nota: la memoria es por instancia. Para despliegues con muchas instancias
// (o escala grande) se recomienda migrar a Upstash Redis usando la misma API.

type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

// Limpieza periódica para evitar fugas de memoria.
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = 0;

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfter: number; // segundos hasta poder reintentar
};

/**
 * Comprueba si `identifier` puede realizar una acción.
 * @param identifier  Clave única (ej: `ip:auth`)
 * @param limit       Máximo de peticiones permitidas en la ventana
 * @param windowMs    Tamaño de la ventana en milisegundos
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  cleanup(now);

  const bucket = store.get(identifier);

  if (!bucket || bucket.resetAt <= now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - bucket.count,
    retryAfter: 0,
  };
}

// Extrae la IP del cliente de forma segura desde los headers.
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "127.0.0.1";
}
