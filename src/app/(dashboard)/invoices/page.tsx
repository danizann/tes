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
import { invoiceStatuses, invoiceTypes } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type Invoice = { id: string; invoiceNumber: string; type: string; status: string; totalAmount: number; createdAt: string; seller?: { name: string } | null; order?: { orderNumber: string } | null };

export default function InvoicesPage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    const response = await fetch(`/api/invoices?search=${encodeURIComponent(search)}&status=${status === "all" ? "" : status}&type=${type === "all" ? "" : type}&page=${page}`);
    const result = await response.json();
    setData(result.data ?? []);
    setTotalPages(result.totalPages ?? 1);
  }, [search, status, type, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this invoice?")) return;
    const response = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast({ title: "Gagal", description: "Tidak dapat menghapus invoice", variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: "Invoice dihapus" });
    loadData();
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Invoices" }]} />
      <PageHeader title="Invoices" description="Kelola invoice seller, surat jalan, dan tagihan supplier." action={{ label: "Bulk Print", href: "/invoices/bulk-print" }} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-[2fr,1fr,1fr]">
            <Input placeholder="Search invoices..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <Select value={type} onValueChange={(value) => { setType(value); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Types</SelectItem>{invoiceTypes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem>{invoiceStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice Number</TableHead><TableHead>Type</TableHead><TableHead>Party</TableHead><TableHead>Order</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.length ? data.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">#{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.type}</TableCell>
                  <TableCell>{invoice.seller?.name ?? "Internal / Supplier"}</TableCell>
                  <TableCell>{invoice.order?.orderNumber ?? "-"}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell><StatusBadge value={invoice.status} /></TableCell>
                  <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2"><Button asChild size="sm" variant="outline"><Link href={`/invoices/${invoice.id}`}>View</Link></Button><Button asChild size="sm" variant="outline"><Link href={`/invoices/${invoice.id}/edit`}>Edit</Link></Button><Button size="sm" variant="destructive" onClick={() => deleteItem(invoice.id)}>Delete</Button></div></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={8}>No invoices found.</TableCell></TableRow>}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
