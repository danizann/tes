"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type ProductDetail = {
  id: string;
  code: string;
  name: string;
  stock: number;
  lowStockAt: number;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  photo?: string | null;
  category?: { name: string } | null;
  supplier?: { name: string } | null;
  stockLogs: Array<{ id: string; type: string; qty: number; notes?: string | null; createdAt: string }>;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`).then((res) => res.json()).then(setProduct);
  }, [params.id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: product.name }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">{product.code}</p>
        </div>
        <Button asChild><Link href={`/products/${product.id}/edit`}>Edit Product</Link></Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <Card>
          <CardHeader><CardTitle>Product Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">Category:</span> {product.category?.name ?? "-"}</p>
            <p><span className="font-medium">Supplier:</span> {product.supplier?.name ?? "-"}</p>
            <p><span className="font-medium">Stock:</span> {product.stock} {product.unit}</p>
            <p><span className="font-medium">Low stock alert:</span> {product.lowStockAt}</p>
            <p><span className="font-medium">Buy price:</span> {formatCurrency(product.buyPrice)}</p>
            <p><span className="font-medium">Sell price:</span> {formatCurrency(product.sellPrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Stock History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Qty</TableHead><TableHead>Notes</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
              <TableBody>
                {product.stockLogs.length ? product.stockLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell><StatusBadge value={log.type} /></TableCell>
                    <TableCell>{log.qty}</TableCell>
                    <TableCell>{log.notes ?? "-"}</TableCell>
                    <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={4}>Belum ada histori.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
