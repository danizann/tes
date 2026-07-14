"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

type Order = { id: string; orderNumber: string; sellerId: string; items: Array<{ qty: number; price: number }> };

function GenerateOrderLetterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultOrderId = searchParams.get("orderId") ?? "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderId, setOrderId] = useState(defaultOrderId);

  useEffect(() => {
    fetch("/api/orders?limit=100").then((res) => res.json()).then((result) => setOrders(result.data ?? []));
  }, []);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === orderId), [orders, orderId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrder) return;
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ORDER_LETTER",
        orderId: selectedOrder.id,
        totalAmount: selectedOrder.items.reduce((sum, item) => sum + item.qty * item.price, 0),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast({ title: "Gagal", description: result.error ?? "Tidak dapat membuat surat jalan", variant: "destructive" });
      return;
    }
    router.push(`/invoices/${result.id}`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Invoices", href: "/invoices" }, { label: "Order Letter" }]} />
      <PageHeader title="Generate Order Letter" description="Buat surat jalan dengan barcode untuk order terpilih." />
      <Card>
        <CardHeader><CardTitle>Select Order</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-2">
              <Label>Order</Label>
              <Select value={orderId} onValueChange={setOrderId}>
                <SelectTrigger><SelectValue placeholder="Select order" /></SelectTrigger>
                <SelectContent>{orders.map((order) => <SelectItem key={order.id} value={order.id}>{order.orderNumber}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end"><Button type="submit">Generate Order Letter</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateOrderLetterInner />
    </Suspense>
  );
}
