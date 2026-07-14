"use client";

import { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

type StockLog = { id: string; type: string; qty: number; notes?: string | null; createdAt: string; product: { code: string; name: string; unit: string } };

export default function StockHistoryPage() {
  const [data, setData] = useState<StockLog[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    const response = await fetch(`/api/stock?search=${encodeURIComponent(search)}&type=${type === "all" ? "" : type}&page=${page}`);
    const result = await response.json();
    setData(result.data ?? []);
    setTotalPages(result.totalPages ?? 1);
  }, [search, type, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <Breadcrumb items={[{ label: "Stock History" }]} />
      <PageHeader title="Stock History" description="Lacak seluruh mutasi stok masuk dan keluar." />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <Input placeholder="Search stock logs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <Select value={type} onValueChange={(value) => { setType(value); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="IN">IN</SelectItem><SelectItem value="OUT">OUT</SelectItem></SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Qty</TableHead><TableHead>Notes</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.length ? data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.product.name}</TableCell>
                  <TableCell>{log.product.code}</TableCell>
                  <TableCell><StatusBadge value={log.type} /></TableCell>
                  <TableCell>{log.qty} {log.product.unit}</TableCell>
                  <TableCell>{log.notes ?? "-"}</TableCell>
                  <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6}>No stock history found.</TableCell></TableRow>}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
