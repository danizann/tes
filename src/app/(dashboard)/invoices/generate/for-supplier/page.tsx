"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type Supplier = { id: string; name: string };

export default function GenerateSupplierInvoicePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierName, setSupplierName] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/suppliers?limit=100").then((res) => res.json()).then((result) => setSuppliers(result.data ?? []));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "FOR_SUPPLIER", totalAmount, notes: `Supplier: ${supplierName}
${notes}` }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast({ title: "Gagal", description: result.error ?? "Tidak dapat membuat invoice supplier", variant: "destructive" });
      return;
    }
    router.push(`/invoices/${result.id}`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Invoices", href: "/invoices" }, { label: "For Supplier" }]} />
      <PageHeader title="Generate Supplier Invoice" description="Buat tagihan untuk kebutuhan pengadaan dari supplier." />
      <Card>
        <CardHeader><CardTitle>Supplier Invoice Data</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-2"><Label>Supplier</Label><Select value={supplierName} onValueChange={setSupplierName}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map((supplier) => <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Total Amount</Label><Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} /></div>
            <div className="grid gap-2"><Label>Notes</Label><Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="flex justify-end"><Button type="submit">Generate Supplier Invoice</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
