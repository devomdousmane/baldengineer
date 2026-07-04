"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard, Users, FileText, Receipt, Wallet, Briefcase,
  BookOpen, Settings, Mail, FileCheck2, ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface Section {
  id: string;
  icon: ReactNode;
  title: string;
  intro: string;
  items: { q: string; a: string }[];
}

const SECTIONS: Section[] = [
  {
    id: "dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    title: "Tableau de bord",
    intro: "Vue d'ensemble de votre activité : chiffre d'affaires, devis, factures, missions.",
    items: [
      { q: "Comment changer la période affichée ?", a: "Utilisez les pastilles « Ce mois / Ce trimestre / Cette année » en haut du tableau de bord. Tous les KPIs et le graphique se recalculent automatiquement." },
      { q: "Puis-je voir les deux marchés en même temps ?", a: "Oui, le filtre marché propose « Tous » en plus de France et Guinée. Les compteurs (clients, missions) sont alors cumulés ; les montants restent affichés dans la devise de votre marché par défaut." },
      { q: "Que montrent les graphiques en donut ?", a: "La répartition de vos devis et factures par statut (brouillon, envoyé, payé, en retard…), pour repérer d'un coup d'œil ce qui nécessite une action." },
      { q: "Qu'est-ce que « Échéances à venir » ?", a: "La liste des missions actives dont la date de début ou de fin tombe dans les 7 prochains jours, pour anticiper votre charge." },
    ],
  },
  {
    id: "clients",
    icon: <Users className="w-4 h-4" />,
    title: "Clients",
    intro: "Votre portefeuille clients, France et Guinée, avec leurs identifiants fiscaux.",
    items: [
      { q: "Comment ajouter un client ?", a: "Cliquez sur « Nouveau client », renseignez le nom, le marché et le type (entreprise ou particulier). Les champs fiscaux s'adaptent automatiquement au marché choisi." },
      { q: "Comment modifier un client existant ?", a: "Cliquez sur une ligne dans la liste (vue tableau, grille ou liste) pour ouvrir sa fiche d'édition." },
      { q: "Quelle différence entre SIREN, TVA et NIF ?", a: "Un client France utilise un SIREN/SIRET et un numéro de TVA intracommunautaire. Un client Guinée utilise un NIF (Numéro d'Identification Fiscale)." },
      { q: "Comment filtrer la liste ?", a: "Utilisez la barre de recherche et les filtres « Entreprises / Particuliers » au-dessus de la table." },
    ],
  },
  {
    id: "devis",
    icon: <FileText className="w-4 h-4" />,
    title: "Devis",
    intro: "Créez des propositions commerciales et suivez leur cycle de vie jusqu'à la conversion en facture.",
    items: [
      { q: "Quel est le cycle de vie d'un devis ?", a: "Brouillon → Envoyé → Accepté ou Refusé ou Expiré. Un devis Accepté peut être converti en facture en un clic." },
      { q: "Comment envoyer un devis au client ?", a: "Depuis la fiche du devis, cliquez sur « Envoyer par email ». Le devis passe automatiquement au statut Envoyé et un email professionnel est expédié au client avec un lien de consultation." },
      { q: "Comment relancer un client avant expiration ?", a: "Le bouton « Relancer client », disponible sur les devis envoyés, déclenche un email de rappel automatique." },
      { q: "Comment convertir un devis en facture ?", a: "Sur un devis Accepté, cliquez sur « Convertir en facture » — toutes les lignes sont reprises automatiquement, aucune ressaisie nécessaire." },
    ],
  },
  {
    id: "factures",
    icon: <Receipt className="w-4 h-4" />,
    title: "Factures",
    intro: "Facturation complète avec suivi des paiements et conformité Factur-X pour la France.",
    items: [
      { q: "Comment enregistrer un paiement ?", a: "Ouvrez la facture, cliquez sur « Enregistrer paiement », indiquez le montant reçu et le mode de paiement. Le statut passe à Partielle ou Payée selon le montant, et l'écriture comptable correspondante est créée automatiquement." },
      { q: "Comment relancer un impayé ?", a: "Le menu « Relancer » propose 3 niveaux : 1ère relance, 2ème relance, puis Mise en demeure — chacun envoie un email adapté au niveau d'urgence." },
      { q: "Qu'est-ce que Factur-X ?", a: "Le format de facture électronique obligatoire en France (XML embarqué dans le PDF). Pour les factures françaises envoyées, un bouton « Soumettre Factur-X » est disponible sur la fiche facture." },
      { q: "Comment télécharger une facture en PDF ?", a: "Utilisez le bouton « Imprimer / PDF » en haut de la fiche facture, qui ouvre une version imprimable dans un nouvel onglet." },
    ],
  },
  {
    id: "paiements",
    icon: <Wallet className="w-4 h-4" />,
    title: "Paiements",
    intro: "Vue consolidée de tous vos encaissements, tous statuts confondus.",
    items: [
      { q: "En quoi cette page diffère-t-elle de Factures ?", a: "Paiements se concentre sur l'angle encaissement : montant encaissé, restant dû, retards — avec une répartition par statut cliquable pour filtrer rapidement." },
      { q: "Comment filtrer par statut ?", a: "Cliquez directement sur une carte de répartition (En attente, Partielle, En retard, Payée) pour filtrer la table en dessous." },
    ],
  },
  {
    id: "missions",
    icon: <Briefcase className="w-4 h-4" />,
    title: "Missions",
    intro: "Suivi de vos missions en régie ou au forfait, avec budget prévisionnel.",
    items: [
      { q: "Comment calculer le budget d'une mission ?", a: "Renseignez le TJM (taux journalier) et le nombre de jours estimés — le budget prévisionnel est calculé automatiquement." },
      { q: "Qu'est-ce que la vue Kanban ?", a: "Une vue par glisser-déposer classant les missions par statut (À démarrer, En cours, Terminée, Annulée). Faites glisser une carte d'une colonne à l'autre pour changer son statut." },
      { q: "Comment facturer une mission terminée ?", a: "Créez une nouvelle facture depuis la page Factures, en sélectionnant le client associé à la mission." },
    ],
  },
  {
    id: "comptabilite",
    icon: <BookOpen className="w-4 h-4" />,
    title: "Comptabilité",
    intro: "Suivi des recettes et dépenses, avec écritures automatiques liées aux paiements.",
    items: [
      { q: "Les écritures sont-elles créées automatiquement ?", a: "Oui — chaque paiement enregistré sur une facture génère automatiquement une écriture de type « Recette ». Vous pouvez aussi ajouter des écritures manuelles (dépenses, autres recettes)." },
      { q: "Que montre le rapport en haut de page ?", a: "Un graphique mensuel comparant recettes et dépenses sur l'année en cours, ainsi que le solde net cumulé." },
    ],
  },
  {
    id: "email",
    icon: <Mail className="w-4 h-4" />,
    title: "Envoi d'emails",
    intro: "Tous les emails (devis, factures, relances, confirmations) partent de votre adresse professionnelle.",
    items: [
      { q: "Qui reçoit les emails envoyés ?", a: "L'adresse email renseignée sur la fiche du client. Vous pouvez la modifier ponctuellement dans la fenêtre d'envoi avant de valider." },
      { q: "Puis-je personnaliser le message ?", a: "Oui, chaque fenêtre d'envoi propose un champ « Message personnalisé » qui remplace le texte par défaut du modèle." },
      { q: "Comment savoir si un email a bien été envoyé ?", a: "Un message de confirmation s'affiche dans la fenêtre d'envoi. Chaque envoi est aussi journalisé pour traçabilité." },
    ],
  },
  {
    id: "parametres",
    icon: <Settings className="w-4 h-4" />,
    title: "Paramètres",
    intro: "Configuration de votre entreprise, appliquée automatiquement à tous vos documents.",
    items: [
      { q: "À quoi sert le marché par défaut ?", a: "Il détermine la devise, les identifiants fiscaux et les préfixes de numérotation utilisés par défaut. Les champs fiscaux affichés s'adaptent automatiquement (SIREN/TVA pour France, NIF pour Guinée)." },
      { q: "Où configurer mon IBAN ?", a: "Dans l'onglet « Banque » des paramètres — ces coordonnées apparaissent en pied de vos factures." },
      { q: "Comment changer le préfixe de mes factures (ex. FAC-2026-) ?", a: "Dans l'onglet « Documents » des paramètres, un préfixe est configurable séparément pour les devis et les factures, par marché." },
    ],
  },
  {
    id: "facturx",
    icon: <FileCheck2 className="w-4 h-4" />,
    title: "Conformité France",
    intro: "Ce qui est spécifique au marché français : Factur-X, TVA, mentions légales.",
    items: [
      { q: "Dois-je soumettre toutes mes factures en Factur-X ?", a: "La réglementation impose progressivement la facturation électronique en France. Le bouton « Soumettre Factur-X » est disponible sur les factures françaises envoyées." },
      { q: "Comment ajouter mes mentions légales obligatoires ?", a: "Dans Paramètres → onglet Documents, le champ « Mentions légales » est repris en pied de chaque facture." },
    ],
  },
];

function HelpSection({ section, index }: { section: Section; index: number }) {
  return (
    <motion.div
      id={section.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease }}
      className="scroll-mt-[calc(var(--header-height)+1rem)]"
    >
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
            {section.icon}
          </div>
          <h2 className="font-heading text-base font-semibold text-[var(--color-text)]">{section.title}</h2>
        </div>
        <p className="text-xs text-[var(--color-text-2)] mb-4 pl-11">{section.intro}</p>

        <div className="space-y-3 pl-0 sm:pl-11">
          {section.items.map((item, i) => (
            <div key={i} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="text-sm font-medium text-[var(--color-text)] mb-1">{item.q}</p>
              <p className="text-xs text-[var(--color-text-2)] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export default function AidePage() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  const scrollTo = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Header title="Aide & documentation" subtitle="Tout comprendre sur BaldPro" />
      <PageWrapper
        aside={
          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.15, ease }}
            className="hidden lg:block w-60 shrink-0 self-start sticky top-[calc(var(--header-height)+1.5rem)]"
          >
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[var(--color-border)]">
                <p className="text-sm font-semibold text-[var(--color-text)] font-heading">Sommaire</p>
              </div>
              <nav className="p-2">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-md)] text-xs text-left transition-colors duration-[var(--dur-fast)] cursor-pointer ${
                      activeId === s.id
                        ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-medium"
                        : "text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    <span className="shrink-0">{s.icon}</span>
                    <span className="flex-1 truncate">{s.title}</span>
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>
        }
      >
        {SECTIONS.map((section, i) => (
          <HelpSection key={section.id} section={section} index={i} />
        ))}
      </PageWrapper>
    </>
  );
}
