"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, Receipt, Wallet, Briefcase,
  BookOpen, Settings, LogOut, X, HelpCircle, Sparkles, Send, ArrowLeft,
} from "lucide-react";
import { MarketSwitcher } from "./market-switcher";
import { useSidebar } from "./sidebar-context";
import type { Market } from "@/types/database";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavItemWithTour extends NavItem {
  tourId?: string;
}

const navItems: NavItemWithTour[] = [
  { href: "/",             label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/clients",      label: "Clients",          icon: Users,     tourId: "nav-clients"  },
  { href: "/devis",        label: "Devis",            icon: FileText,  tourId: "nav-devis"    },
  { href: "/factures",     label: "Factures",         icon: Receipt,   tourId: "nav-factures" },
  { href: "/paiements",    label: "Paiements",        icon: Wallet          },
  { href: "/emails",       label: "Suivi emails",     icon: Send            },
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
  onTourStart?: () => void;
}

export function Sidebar({ userName, userAvatar, market, onSignOut, onTourStart }: SidebarProps) {
  const pathname = usePathname();
  const { mobileOpen, closeMobile } = useSidebar();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  /* Fermer le drawer mobile à chaque navigation */
  const handleNavigate = () => closeMobile();

  const content = (
    <>
      {/* Logo */}
      <motion.div
        data-tour="logo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05, ease }}
        className="flex items-center justify-between px-4 border-b border-[var(--color-border)]"
        style={{ height: "var(--header-height)" }}
      >
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL ?? "/"}
          className="flex items-center"
          aria-label="Retour au site BaldEngineer"
        >
          <Image
            src="/logo.png"
            alt="BaldEngineer"
            width={206}
            height={121}
            priority
            unoptimized
            className="w-auto h-10 object-contain brightness-0 invert"
          />
        </a>
        <button
          onClick={closeMobile}
          className="lg:hidden w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] transition-colors shrink-0"
          aria-label="Fermer le menu"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Market switcher */}
      <motion.div
        data-tour="market-switcher"
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
          {navItems.map(({ href, label, icon: Icon, tourId }) => {
            const active = isActive(href);
            return (
              <motion.li key={href} variants={navItem}>
                <Link
                  href={href}
                  onClick={handleNavigate}
                  data-tour={tourId}
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
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL ?? "/"}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Retour au site</span>
        </a>

        {onTourStart && (
          <button
            onClick={() => { handleNavigate(); onTourStart(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Visite guidée</span>
          </button>
        )}

        <Link
          href="/aide"
          onClick={handleNavigate}
          data-tour="nav-aide"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors duration-[var(--dur-fast)] ${
            pathname.startsWith("/aide")
              ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
              : "text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)]"
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Aide</span>
        </Link>

        <Link
          href="/settings"
          onClick={handleNavigate}
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
    </>
  );

  return (
    <>
      {/* Desktop — toujours visible */}
      <aside
        className="sidebar-surface hidden lg:flex flex-col fixed left-0 top-0 bottom-0 border-r border-[var(--color-border)] z-[var(--z-sidebar)]"
        style={{ width: "var(--sidebar-width)" }}
        aria-label="Navigation principale"
      >
        {content}
      </aside>

      {/* Mobile/tablette — drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden fixed inset-0 z-[var(--z-overlay)] bg-black/40 backdrop-blur-sm"
              onClick={closeMobile}
            />
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="sidebar-surface lg:hidden flex flex-col fixed left-0 top-0 bottom-0 z-[var(--z-modal)] border-r border-[var(--color-border)] w-72 max-w-[85vw]"
              aria-label="Navigation principale"
              role="dialog"
              aria-modal="true"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
