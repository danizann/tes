"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

type SellerDetail = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  marketplace?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  orders: Array<{ id: string; orderNumber: string; status: string; createdAt: string; items: Array<{ qty: number; price: number }> }>;
  invoices: Array<{ id: string; invoiceNumber: string; status: string; totalAmount: number }>;
};

export default function SellerDetailPage() {
  const params = useParams<{ id: string }>();
  const [seller, setSeller] = useState<SellerDetail | null>(null);

  useEffect(() => {
    fetch(`/api/sellers/${params.id}`).then((res) => res.json()).then(setSeller);
  }, [params.id]);

  if (!seller) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Sellers", href: "/sellers" }, { label: seller.name }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{seller.name}</h1>
          <p className="text-muted-foreground">{seller.marketplace ?? "Marketplace belum diisi"}</p>
        </div>
        <Button asChild><Link href={`/sellers/${seller.id}/edit`}>Edit Seller</Link></Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <Card>
          <CardHeader><CardTitle>Seller Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">Phone:</span> {seller.phone ?? "-"}</p>
            <p><span className="font-medium">Email:</span> {seller.email ?? "-"}</p>
            <p><span className="font-medium">Address:</span> {seller.address ?? "-"}</p>
            <p><span className="font-medium">Notes:</span> {seller.notes ?? "-"}</p>
            <p><span className="font-medium">Created:</span> {formatDate(seller.createdAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Order Number</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
              <TableBody>
                {seller.orders.length ? seller.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell><StatusBadge value={order.status} /></TableCell>
                    <TableCell>{formatCurrency(order.items.reduce((sum, item) => sum + item.qty * item.price, 0))}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={4}>Belum ada order.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
