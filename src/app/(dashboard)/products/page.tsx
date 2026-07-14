"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Product = { id: string; code: string; name: string; stock: number; lowStockAt: number; buyPrice: number; sellPrice: number; unit: string; category?: { name: string } | null; supplier?: { name: string } | null };

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    const response = await fetch(`/api/products?search=${encodeURIComponent(search)}&lowStock=${lowStock}&page=${page}`);
    const result = await response.json();
    setData(result.data ?? []);
    setTotalPages(result.totalPages ?? 1);
  }, [search, lowStock, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast({ title: "Gagal", description: "Tidak dapat menghapus produk", variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: "Produk dihapus" });
    loadData();
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Products" }]} />
      <PageHeader title="Products" description="Kelola produk, harga, dan stok gudang." action={{ label: "Add Product", href: "/products/new" }} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input className="md:max-w-md" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={lowStock} onCheckedChange={(checked) => { setLowStock(Boolean(checked)); setPage(1); }} /> Low stock only</label>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Supplier</TableHead><TableHead>Stock</TableHead><TableHead>Buy Price</TableHead><TableHead>Sell Price</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.length ? data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category?.name ?? "-"}</TableCell>
                  <TableCell>{product.supplier?.name ?? "-"}</TableCell>
                  <TableCell>{product.stock} {product.unit} {product.stock <= product.lowStockAt ? <Badge variant="warning" className="ml-2">Low</Badge> : null}</TableCell>
                  <TableCell>{formatCurrency(product.buyPrice)}</TableCell>
                  <TableCell>{formatCurrency(product.sellPrice)}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2"><Button asChild size="sm" variant="outline"><Link href={`/products/${product.id}`}>View</Link></Button><Button asChild size="sm" variant="outline"><Link href={`/products/${product.id}/edit`}>Edit</Link></Button><Button size="sm" variant="destructive" onClick={() => deleteItem(product.id)}>Delete</Button></div></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={8}>No products found.</TableCell></TableRow>}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
