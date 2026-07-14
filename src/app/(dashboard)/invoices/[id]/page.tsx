"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { InvoicePrintView, type PrintableInvoice } from "@/components/invoices/InvoicePrintView";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type InvoiceDetail = PrintableInvoice;

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);

  useEffect(() => {
    fetch(`/api/invoices/${params.id}`).then((res) => res.json()).then(setInvoice);
  }, [params.id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoice?.invoiceNumber,
  });

  const markPrinted = async () => {
    if (!invoice) return;
    await fetch(`/api/invoices/${invoice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...invoice, printedAt: new Date().toISOString() }),
    });
  };

  if (!invoice) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Invoices", href: "/invoices" }, { label: invoice.invoiceNumber }]} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">#{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">{invoice.type.replace(/_/g, " ")} · <StatusBadge value={invoice.status} /></p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button variant="outline" asChild><Link href={`/invoices/${invoice.id}/edit`}>Edit Invoice</Link></Button>
          <Button variant="outline" asChild><Link href="/invoices/bulk-print">Bulk Print</Link></Button>
          <Button onClick={async () => { await markPrinted(); handlePrint(); router.refresh(); }}>Print Invoice</Button>
        </div>
      </div>
      <Card className="no-print">
        <CardHeader><CardTitle>Invoice Summary</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
          <div><p className="text-muted-foreground">Party</p><p className="font-medium">{invoice.seller?.name ?? "Supplier / Internal"}</p></div>
          <div><p className="text-muted-foreground">Order</p><p className="font-medium">{invoice.order?.orderNumber ?? "-"}</p></div>
          <div><p className="text-muted-foreground">Total</p><p className="font-medium">{formatCurrency(invoice.totalAmount)}</p></div>
        </CardContent>
      </Card>
      <div ref={printRef}>
        <InvoicePrintView invoice={invoice} />
      </div>
    </div>
  );
}
