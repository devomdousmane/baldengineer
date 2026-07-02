"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, Receipt, Briefcase,
  BookOpen, Settings, LogOut,
} from "lucide-react";
import { MarketSwitcher } from "./market-switcher";
import type { Market } from "@/types/database";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/",             label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/clients",      label: "Clients",          icon: Users           },
  { href: "/devis",        label: "Devis",            icon: FileText        },
  { href: "/factures",     label: "Factures",         icon: Receipt         },
  { href: "/missions",     label: "Missions",         icon: Briefcase       },
  { href: "/comptabilite", label: "Comptabilité",     icon: BookOpen        },
];

const navContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } },
};
const navItem = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease } },
};

interface SidebarProps {
  userName?: string;
  userAvatar?: string | null;
  market: Market;
  onSignOut?: () => void;
  onAiOpen?: () => void;
}

export function Sidebar({ userName, userAvatar, market, onSignOut, onAiOpen }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease }}
      className="fixed left-0 top-0 bottom-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] z-[var(--z-sidebar)]"
      style={{ width: "var(--sidebar-width)" }}
      aria-label="Navigation principale"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05, ease }}
        className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]"
        style={{ height: "var(--header-height)" }}
      >
        <div
          className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: "var(--color-primary)" }}
          aria-hidden="true"
        >
          BP
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-sm text-[var(--color-text)] leading-none truncate">BaldPro</p>
          <p className="text-[10px] text-[var(--color-text-3)] mt-0.5 uppercase tracking-widest">v1.0</p>
        </div>
      </motion.div>

      {/* Market switcher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1, ease }}
      >
        <MarketSwitcher market={market} />
      </motion.div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2" role="navigation">
        <motion.ul
          variants={navContainer}
          initial="hidden"
          animate="visible"
          className="space-y-0.5"
          role="list"
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <motion.li key={href} variants={navItem}>
                <Link
                  href={href}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-all duration-[var(--dur-fast)]
                    ${active
                      ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-medium"
                      : "text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)]"
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
                  <span className="flex-1 truncate">{label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: "var(--color-accent)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>

      {/* Bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3, ease }}
        className="border-t border-[var(--color-border)] p-2 space-y-0.5"
      >
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors duration-[var(--dur-fast)] ${
            pathname.startsWith("/settings")
              ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
              : "text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)]"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Paramètres</span>
        </Link>

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-2 mt-1">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              (userName?.[0] ?? "?").toUpperCase()
            )}
          </div>
          <p className="text-xs text-[var(--color-text-2)] flex-1 truncate">{userName ?? "Utilisateur"}</p>
          <button
            onClick={onSignOut}
            className="text-[var(--color-text-3)] hover:text-[var(--color-danger)] transition-colors p-1"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </motion.aside>
  );
}
