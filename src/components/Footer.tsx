import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6">
        <p>
          Comunidad <span className="font-medium text-foreground">Jóvenes en Acción</span> · Ecuador
        </p>
        <p className="inline-flex items-center gap-1.5">
          Hecho con <Heart size={14} className="text-accent" /> por y para la comunidad
        </p>
      </div>
      <p className="pb-6 text-center text-[11px] text-muted/70 px-4">
        Iniciativa comunitaria independiente. No afiliada oficialmente al Gobierno del Ecuador.
      </p>
    </footer>
  );
}
