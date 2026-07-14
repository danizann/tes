"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

type Supplier = { id: string; name: string; phone?: string | null; email?: string | null; createdAt: string; _count: { products: number; purchases: number } };

export default function SuppliersPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/suppliers?search=${encodeURIComponent(search)}&page=${page}`);
    const result = await response.json();
    setData(result.data ?? []);
    setTotalPages(result.totalPages ?? 1);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this supplier?")) return;
    const response = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast({ title: "Gagal", description: "Tidak dapat menghapus supplier", variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: "Supplier dihapus" });
    loadData();
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Suppliers" }]} />
      <PageHeader title="Suppliers" description="Kelola daftar pemasok barang." action={{ label: "Add Supplier", href: "/suppliers/new" }} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input placeholder="Search suppliers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
              ) : data.length ? data.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.phone ?? "-"}</TableCell>
                  <TableCell>{supplier.email ?? "-"}</TableCell>
                  <TableCell>{supplier._count.products}</TableCell>
                  <TableCell>{formatDate(supplier.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline"><Link href={`/suppliers/${supplier.id}`}>View</Link></Button>
                      <Button asChild size="sm" variant="outline"><Link href={`/suppliers/${supplier.id}/edit`}>Edit</Link></Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem(supplier.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6}>No suppliers found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
