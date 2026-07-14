"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  expedition?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  seller: { name: string; marketplace?: string | null };
  items: Array<{ id: string; qty: number; price: number; product: { code: string; name: string; unit: string } }>;
  invoices: Array<{ id: string; invoiceNumber: string; status: string; type: string }>;
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`).then((res) => res.json()).then(setOrder);
  }, [params.id]);

  const total = useMemo(() => order?.items.reduce((sum, item) => sum + item.qty * item.price, 0) ?? 0, [order]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Orders", href: "/orders" }, { label: order.orderNumber }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
          <p className="text-muted-foreground">Dibuat {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href={`/invoices/generate/order-letter?orderId=${order.id}`}>Generate Order Letter</Link></Button>
          <Button asChild><Link href={`/orders/${order.id}/edit`}>Edit Order</Link></Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <Card>
          <CardHeader><CardTitle>Order Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">Seller:</span> {order.seller.name}</p>
            <p><span className="font-medium">Marketplace:</span> {order.seller.marketplace ?? "-"}</p>
            <p><span className="font-medium">Status:</span> <StatusBadge value={order.status} /></p>
            <p><span className="font-medium">Expedition:</span> {order.expedition ?? "-"}</p>
            <p><span className="font-medium">Tracking Number:</span> {order.trackingNumber ?? "-"}</p>
            <p><span className="font-medium">Notes:</span> {order.notes ?? "-"}</p>
            <p><span className="font-medium">Total:</span> {formatCurrency(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Code</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead>Subtotal</TableHead></TableRow></TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.product.code}</TableCell>
                    <TableCell>{item.qty} {item.product.unit}</TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>{formatCurrency(item.qty * item.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Related Invoices</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice Number</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {order.invoices.length ? order.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell><Link href={`/invoices/${invoice.id}`} className="font-medium text-primary underline-offset-4 hover:underline">#{invoice.invoiceNumber}</Link></TableCell>
                  <TableCell>{invoice.type}</TableCell>
                  <TableCell><StatusBadge value={invoice.status} /></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={3}>Belum ada invoice.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
