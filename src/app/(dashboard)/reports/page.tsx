import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const [allProducts, orderStatus, invoiceStatus, topSellers] = await Promise.all([
    prisma.product.findMany({ orderBy: { stock: "asc" }, include: { supplier: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.invoice.groupBy({ by: ["status"], _sum: { totalAmount: true }, _count: { _all: true } }),
    prisma.seller.findMany({ include: { orders: { include: { items: true } } }, take: 5 }),
  ]);

  const lowStockProducts = allProducts.filter((product) => product.stock <= product.lowStockAt).slice(0, 10);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Reports" }]} />
      <PageHeader title="Reports" description="Ringkasan performa bisnis dan kondisi inventori." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Low Stock Products</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Supplier</TableHead><TableHead>Stock</TableHead><TableHead>Alert At</TableHead></TableRow></TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => <TableRow key={product.id}><TableCell>{product.name}</TableCell><TableCell>{product.supplier?.name ?? "-"}</TableCell><TableCell>{product.stock}</TableCell><TableCell>{product.lowStockAt}</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {orderStatus.map((item) => <div key={item.status} className="flex items-center justify-between rounded-lg border p-3"><span>{item.status}</span><span className="font-semibold">{item._count._all}</span></div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Invoice Collections</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {invoiceStatus.map((item) => <div key={item.status} className="flex items-center justify-between rounded-lg border p-3"><span>{item.status}</span><span className="font-semibold">{item._count._all} · {formatCurrency(item._sum.totalAmount ?? 0)}</span></div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Sellers by Revenue</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Seller</TableHead><TableHead>Orders</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
              <TableBody>
                {topSellers.map((seller) => {
                  const revenue = seller.orders.reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + item.qty * item.price, 0), 0);
                  return <TableRow key={seller.id}><TableCell>{seller.name}</TableCell><TableCell>{seller.orders.length}</TableCell><TableCell>{formatCurrency(revenue)}</TableCell></TableRow>;
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
