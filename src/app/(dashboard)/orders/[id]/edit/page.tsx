"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { OrderForm, type OrderPayload } from "@/components/forms/OrderForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function EditOrderPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<OrderPayload | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`).then((res) => res.json()).then((result) => setData({
      sellerId: result.sellerId,
      status: result.status,
      expedition: result.expedition,
      trackingNumber: result.trackingNumber,
      notes: result.notes,
      items: result.items.map((item: { productId: string; qty: number; price: number }) => ({
        productId: item.productId,
        qty: item.qty,
        price: item.price,
      })),
    }));
  }, [params.id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Orders", href: "/orders" }, { label: "Edit" }]} />
      <PageHeader title="Edit Order" description="Perbarui order dan sinkronkan stok produk." />
      <OrderForm initialData={data} endpoint={`/api/orders/${params.id}`} />
    </div>
  );
}
