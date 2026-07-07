"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadFileDialog, type ScannedReceipt } from "@/components/modules/upload-file-dialog";
import type { Market } from "@/types/database";

export function FilesActions({ defaultMarket }: { defaultMarket: Market }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folder");
  const [open, setOpen] = useState(false);

  const handleScanned = (data: ScannedReceipt, fileId: string, market: Market) => {
    const params = new URLSearchParams({
      label: data.label,
      amount: String(data.amount),
      date: data.date,
      category: data.category,
      market,
      receipt_file_id: fileId,
      /* Devise lue sur le document — comparée à celle du marché choisi pour avertir
         en cas d'incohérence (ex. facture en EUR rattachée au marché Guinée/GNF). */
      scanned_currency: data.currency,
    });
    router.push(`/comptabilite/new?${params.toString()}`);
  };

  return (
    <>
      <Button size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={() => setOpen(true)}>
        Ajouter un fichier
      </Button>
      <UploadFileDialog
        open={open}
        onClose={() => setOpen(false)}
        defaultMarket={defaultMarket}
        folderId={currentFolderId}
        onUploaded={() => router.refresh()}
        onScanned={handleScanned}
      />
    </>
  );
}
