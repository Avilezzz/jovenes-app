"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX, MapPin, Building2, RotateCcw } from "lucide-react";
import { GroupCard } from "./GroupCard";
import { CATEGORIES, categoryMeta, type Group } from "@/lib/types";
import { PROVINCES, cantonsOf } from "@/lib/ecuador-dpa";

export function GroupGrid({ groups }: { groups: Group[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todas");
  const [province, setProvince] = useState("");
  const [canton, setCanton] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((g) => {
      const matchCat = category === "Todas" || g.category === category;
      const matchProvince = province === "" || g.province === province;
      const matchCanton = canton === "" || g.canton === canton;
      const matchQuery =
        q === "" ||
        g.name.toLowerCase().includes(q) ||
        (g.description ?? "").toLowerCase().includes(q);
      return matchCat && matchProvince && matchCanton && matchQuery;
    });
  }, [groups, query, category, province, canton]);

  const hasFilters =
    query !== "" || category !== "Todas" || province !== "" || canton !== "";

  function resetFilters() {
    setQuery("");
    setCategory("Todas");
    setProvince("");
    setCanton("");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de búsqueda + filtros */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar grupos por nombre o tema…"
            className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/40"
          />
        </div>

        {/* Filtros de ubicación (provincia → cantón) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setCanton("");
              }}
              className={`w-full appearance-none rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/40 ${province ? "" : "text-muted"}`}
            >
              <option value="">Todas las provincias</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p} className="text-foreground">
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Building2
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <select
              value={canton}
              disabled={!province}
              onChange={(e) => setCanton(e.target.value)}
              className={`w-full appearance-none rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/40 disabled:opacity-50 ${canton ? "" : "text-muted"}`}
            >
              <option value="">
                {province ? "Todos los cantones" : "Elige provincia"}
              </option>
              {cantonsOf(province).map((c) => (
                <option key={c} value={c} className="text-foreground">
                  {c}
                </option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              <RotateCcw size={15} /> Limpiar
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["Todas", ...CATEGORIES].map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-muted hover:text-foreground hover:border-accent/40"
                }`}
              >
                {cat === "Todas" ? "Todas" : categoryMeta(cat).short}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-muted">
        {filtered.length}{" "}
        {filtered.length === 1 ? "grupo encontrado" : "grupos encontrados"}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <SearchX size={40} className="text-muted" />
          <p className="font-medium">No encontramos grupos</p>
          <p className="max-w-sm text-sm text-muted">
            Prueba con otra búsqueda o categoría. ¿Conoces uno que falta?
            ¡Inicia sesión y compártelo con la comunidad!
          </p>
        </div>
      )}
    </div>
  );
}
