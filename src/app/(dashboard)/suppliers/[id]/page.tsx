"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

type SupplierDetail = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  products: Array<{ id: string; code: string; name: string; stock: number; buyPrice: number; sellPrice: number; category?: { name: string } | null }>;
};

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);

  useEffect(() => {
    fetch(`/api/suppliers/${params.id}`).then((res) => res.json()).then(setSupplier);
  }, [params.id]);

  if (!supplier) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Suppliers", href: "/suppliers" }, { label: supplier.name }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{supplier.name}</h1>
          <p className="text-muted-foreground">Dibuat pada {formatDate(supplier.createdAt)}</p>
        </div>
        <Button asChild><Link href={`/suppliers/${supplier.id}/edit`}>Edit Supplier</Link></Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <Card>
          <CardHeader><CardTitle>Supplier Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">Phone:</span> {supplier.phone ?? "-"}</p>
            <p><span className="font-medium">Email:</span> {supplier.email ?? "-"}</p>
            <p><span className="font-medium">Address:</span> {supplier.address ?? "-"}</p>
            <p><span className="font-medium">Notes:</span> {supplier.notes ?? "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Products</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Stock</TableHead><TableHead>Buy</TableHead><TableHead>Sell</TableHead></TableRow></TableHeader>
              <TableBody>
                {supplier.products.length ? supplier.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category?.name ?? "-"}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{formatCurrency(product.buyPrice)}</TableCell>
                    <TableCell>{formatCurrency(product.sellPrice)}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={6}>Belum ada produk.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
