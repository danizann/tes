"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { invoiceStatuses, invoiceTypes } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";

type EditInvoice = { type: string; sellerId?: string | null; orderId?: string | null; status: string; totalAmount: number; notes?: string | null };

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<EditInvoice | null>(null);

  useEffect(() => {
    fetch(`/api/invoices/${params.id}`).then((res) => res.json()).then((result) => setForm({
      type: result.type,
      sellerId: result.sellerId,
      orderId: result.orderId,
      status: result.status,
      totalAmount: result.totalAmount,
      notes: result.notes,
    }));
  }, [params.id]);

  if (!form) return <div>Loading...</div>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(`/api/invoices/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      toast({ title: "Gagal", description: "Tidak dapat menyimpan invoice", variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: "Invoice diperbarui" });
    router.push(`/invoices/${params.id}`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Invoices", href: "/invoices" }, { label: "Edit" }]} />
      <PageHeader title="Edit Invoice" description="Perbarui status dan catatan invoice." />
      <Card>
        <CardHeader><CardTitle>Invoice Form</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2"><Label>Type</Label><Select value={form.type} onValueChange={(value) => setForm((prev) => prev ? { ...prev, type: value } : prev)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{invoiceTypes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm((prev) => prev ? { ...prev, status: value } : prev)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{invoiceStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Total Amount</Label><Input type="number" value={form.totalAmount} onChange={(e) => setForm((prev) => prev ? { ...prev, totalAmount: Number(e.target.value) } : prev)} /></div>
            </div>
            <div className="grid gap-2"><Label>Notes</Label><Textarea rows={5} value={form.notes ?? ""} onChange={(e) => setForm((prev) => prev ? { ...prev, notes: e.target.value } : prev)} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="submit">Save Changes</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
