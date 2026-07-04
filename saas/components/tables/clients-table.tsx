"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Mail, Phone, MapPin } from "lucide-react";
import type { Client } from "@/types/database";

const TYPE_FILTERS = [
  { value: "", label: "Tous" },
  { value: "company", label: "Entreprises" },
  { value: "individual", label: "Particuliers" },
];

const columns: Column<Client>[] = [
  {
    key: "name", label: "Nom", sortable: true,
    render: (v) => <span className="font-medium text-[var(--color-text)]">{String(v)}</span>,
  },
  { key: "email", label: "Email", sortable: true },
  { key: "phone", label: "Téléphone" },
  {
    key: "type", label: "Type",
    render: (v) => (
      <Badge variant={v === "company" ? "info" : "default"}>
        {v === "company" ? "Entreprise" : "Particulier"}
      </Badge>
    ),
  },
  {
    key: "market", label: "Marché",
    render: (v) => (
      <Badge variant={v === "france" ? "france" : "guinee"}>
        {v === "france" ? "FR" : "GN"}
      </Badge>
    ),
  },
  {
    key: "siren", label: "SIREN / NIF",
    render: (v, row) => (
      <span className="font-mono text-xs text-[var(--color-text-2)]">
        {row.market === "france" ? (row.siren ?? "—") : (row.nif ?? "—")}
      </span>
    ),
  },
  { key: "city", label: "Ville", sortable: true },
];

function ClientGrid({ clients, onOpen }: { clients: Client[]; onOpen: (c: Client) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {clients.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => onOpen(c)}
          className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border-2)] transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
              {c.type === "company" ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[var(--color-text)] truncate">{c.name}</p>
              <Badge variant={c.market === "france" ? "france" : "guinee"} className="mt-0.5">
                {c.market === "france" ? "France" : "Guinée"}
              </Badge>
            </div>
          </div>
          <div className="space-y-1.5">
            {c.email && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-2)]">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{c.email}</span>
              </div>
            )}
            {c.phone && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-2)]">
                <Phone className="w-3 h-3 shrink-0" />
                <span>{c.phone}</span>
              </div>
            )}
            {c.city && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-3)]">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{c.city}</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ClientList({ clients, onOpen }: { clients: Client[]; onOpen: (c: Client) => void }) {
  return (
    <div className="space-y-1.5">
      {clients.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: i * 0.03 }}
          onClick={() => onOpen(c)}
          className="flex items-center gap-3 px-4 py-3 bg-[var(--color-card)] rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-2)] hover:shadow-[var(--shadow-sm)] transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-xs"
            style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
            {c.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">{c.name}</p>
            <p className="text-xs text-[var(--color-text-3)] truncate">{c.email ?? c.city ?? "—"}</p>
          </div>
          <Badge variant={c.type === "company" ? "info" : "default"}>
            {c.type === "company" ? "Entreprise" : "Particulier"}
          </Badge>
          <Badge variant={c.market === "france" ? "france" : "guinee"}>
            {c.market === "france" ? "FR" : "GN"}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
}

export function ClientsTable({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const openClient = (c: Client) => router.push(`/clients/${c.id}/edit`);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (type && c.type !== type) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${c.name} ${c.email ?? ""} ${c.city ?? ""} ${c.siren ?? ""} ${c.nif ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [clients, search, type]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-text-3)]">{filtered.length} client{filtered.length !== 1 ? "s" : ""}</p>
        <ViewToggle value={view} onChange={setView} />
      </div>
      <ListToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Rechercher un client…"
        filters={TYPE_FILTERS}
        active={type}
        onFilter={setType}
      />

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {view === "table" && (
            <DataTable<Client>
              data={filtered}
              columns={columns}
              emptyMessage="Aucun client — ajoutez votre premier client"
              onRowClick={openClient}
            />
          )}
          {view === "grid" && <ClientGrid clients={filtered} onOpen={openClient} />}
          {view === "list" && <ClientList clients={filtered} onOpen={openClient} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
