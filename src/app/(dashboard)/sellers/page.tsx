"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { marketplaces } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type Seller = { id: string; name: string; phone?: string | null; email?: string | null; marketplace?: string | null; createdAt: string; _count: { orders: number; invoices: number } };

export default function SellersPage() {
  const [data, setData] = useState<Seller[]>([]);
  const [search, setSearch] = useState("");
  const [marketplace, setMarketplace] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    const response = await fetch(`/api/sellers?search=${encodeURIComponent(search)}&marketplace=${marketplace === "all" ? "" : marketplace}&page=${page}`);
    const result = await response.json();
    setData(result.data ?? []);
    setTotalPages(result.totalPages ?? 1);
  }, [page, search, marketplace]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this seller?")) return;
    const response = await fetch(`/api/sellers/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast({ title: "Gagal", description: "Tidak dapat menghapus seller", variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: "Seller dihapus" });
    loadData();
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Sellers" }]} />
      <PageHeader title="Sellers" description="Kelola seluruh seller dan marketplace." action={{ label: "Add Seller", href: "/sellers/new" }} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <Input placeholder="Search sellers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <Select value={marketplace} onValueChange={(value) => { setMarketplace(value); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Marketplaces</SelectItem>
                {marketplaces.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Marketplace</TableHead><TableHead>Phone</TableHead><TableHead>Orders</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.length ? data.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell className="font-medium">{seller.name}</TableCell>
                  <TableCell>{seller.marketplace ?? "-"}</TableCell>
                  <TableCell>{seller.phone ?? "-"}</TableCell>
                  <TableCell>{seller._count.orders}</TableCell>
                  <TableCell>{formatDate(seller.createdAt)}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2"><Button asChild size="sm" variant="outline"><Link href={`/sellers/${seller.id}`}>View</Link></Button><Button asChild size="sm" variant="outline"><Link href={`/sellers/${seller.id}/edit`}>Edit</Link></Button><Button size="sm" variant="destructive" onClick={() => deleteItem(seller.id)}>Delete</Button></div></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6}>No sellers found.</TableCell></TableRow>}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
