"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { orderStatuses } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type Order = { id: string; orderNumber: string; status: string; expedition?: string | null; seller: { name: string }; createdAt: string; items: Array<{ qty: number; price: number }>; invoices: Array<{ id: string }> };

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    const response = await fetch(`/api/orders?search=${encodeURIComponent(search)}&status=${status === "all" ? "" : status}&page=${page}`);
    const result = await response.json();
    setData(result.data ?? []);
    setTotalPages(result.totalPages ?? 1);
  }, [search, status, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this order? Stock will be restored.")) return;
    const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast({ title: "Gagal", description: data.error ?? "Tidak dapat menghapus order", variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: "Order dihapus" });
    loadData();
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Orders" }]} />
      <PageHeader title="Orders" description="Pantau order marketplace dan pengiriman." action={{ label: "Create Order", href: "/orders/new" }} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <Input placeholder="Search orders..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Order Number</TableHead><TableHead>Seller</TableHead><TableHead>Status</TableHead><TableHead>Expedition</TableHead><TableHead>Total</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.length ? data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.seller.name}</TableCell>
                  <TableCell><StatusBadge value={order.status} /></TableCell>
                  <TableCell>{order.expedition ?? "-"}</TableCell>
                  <TableCell>{formatCurrency(order.items.reduce((sum, item) => sum + item.qty * item.price, 0))}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2"><Button asChild size="sm" variant="outline"><Link href={`/orders/${order.id}`}>View</Link></Button><Button asChild size="sm" variant="outline"><Link href={`/orders/${order.id}/edit`}>Edit</Link></Button><Button size="sm" variant="destructive" onClick={() => deleteItem(order.id)}>Delete</Button></div></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7}>No orders found.</TableCell></TableRow>}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
