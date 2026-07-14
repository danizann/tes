"use client";

import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { InvoicePrintView, type PrintableInvoice } from "@/components/invoices/InvoicePrintView";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

type InvoiceRow = { id: string; invoiceNumber: string; type: string; totalAmount: number; createdAt: string; seller?: { name: string } | null };

export default function BulkPrintPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<PrintableInvoice[]>([]);

  useEffect(() => {
    fetch("/api/invoices?limit=100").then((res) => res.json()).then((result) => setInvoices(result.data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedIds.length) {
      setSelectedInvoices([]);
      return;
    }
    Promise.all(selectedIds.map((id) => fetch(`/api/invoices/${id}`).then((res) => res.json()))).then(setSelectedInvoices);
  }, [selectedIds]);

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: "hoodwood-bulk-print" });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Invoices", href: "/invoices" }, { label: "Bulk Print" }]} />
      <PageHeader title="Bulk Print Invoices" description="Pilih beberapa invoice lalu cetak sekaligus." />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Table>
            <TableHeader><TableRow><TableHead></TableHead><TableHead>Invoice Number</TableHead><TableHead>Type</TableHead><TableHead>Party</TableHead><TableHead>Total</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const checked = selectedIds.includes(invoice.id);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell><Checkbox checked={checked} onCheckedChange={(value) => setSelectedIds((prev) => value ? [...prev, invoice.id] : prev.filter((id) => id !== invoice.id))} /></TableCell>
                    <TableCell className="font-medium">#{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.type}</TableCell>
                    <TableCell>{invoice.seller?.name ?? "Internal / Supplier"}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex justify-end"><Button onClick={() => handlePrint()} disabled={!selectedIds.length}>Print Selected ({selectedIds.length})</Button></div>
        </CardContent>
      </Card>
      <div ref={printRef} className="space-y-8">
        {selectedInvoices.map((invoice) => <InvoicePrintView key={invoice.id} invoice={invoice} />)}
      </div>
    </div>
  );
}
