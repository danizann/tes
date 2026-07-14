"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type Seller = { id: string; name: string };
type Order = { id: string; orderNumber: string; sellerId: string; items: Array<{ qty: number; price: number }> };

function GenerateSellerInvoiceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultOrderId = searchParams.get("orderId") ?? "none";
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerId, setSellerId] = useState("");
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [totalAmount, setTotalAmount] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/sellers?limit=100"), fetch("/api/orders?limit=100")]).then(async ([sellerRes, orderRes]) => {
      const sellersData = await sellerRes.json();
      const ordersData = await orderRes.json();
      setSellers(sellersData.data ?? []);
      setOrders(ordersData.data ?? []);
    });
  }, []);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === orderId), [orders, orderId]);

  useEffect(() => {
    if (selectedOrder) {
      setSellerId(selectedOrder.sellerId);
      setTotalAmount(selectedOrder.items.reduce((sum, item) => sum + item.qty * item.price, 0));
    }
  }, [selectedOrder]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "FOR_SELLER", sellerId, orderId: orderId === "none" ? null : orderId, totalAmount, notes }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast({ title: "Gagal", description: result.error ?? "Tidak dapat membuat invoice", variant: "destructive" });
      return;
    }
    router.push(`/invoices/${result.id}`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Invoices", href: "/invoices" }, { label: "For Seller" }]} />
      <PageHeader title="Generate Seller Invoice" description="Buat tagihan invoice untuk seller atau marketplace." />
      <Card>
        <CardHeader><CardTitle>Invoice Data</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-2"><Label>Order (Optional)</Label><Select value={orderId} onValueChange={setOrderId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Without linked order</SelectItem>{orders.map((order) => <SelectItem key={order.id} value={order.id}>{order.orderNumber}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Seller</Label><Select value={sellerId} onValueChange={setSellerId}><SelectTrigger><SelectValue placeholder="Select seller" /></SelectTrigger><SelectContent>{sellers.map((seller) => <SelectItem key={seller.id} value={seller.id}>{seller.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Total Amount</Label><Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} /></div>
            <div className="grid gap-2"><Label>Notes</Label><Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="flex justify-end"><Button type="submit">Generate Invoice</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateSellerInvoiceInner />
    </Suspense>
  );
}
