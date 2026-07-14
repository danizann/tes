"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { ProductForm, type ProductPayload } from "@/components/forms/ProductForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ProductPayload | null>(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`).then((res) => res.json()).then((result) => setData({
      code: result.code,
      name: result.name,
      categoryId: result.categoryId,
      supplierId: result.supplierId,
      buyPrice: result.buyPrice,
      sellPrice: result.sellPrice,
      stock: result.stock,
      unit: result.unit,
      photo: result.photo,
      lowStockAt: result.lowStockAt,
    }));
  }, [params.id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: "Edit" }]} />
      <PageHeader title="Edit Product" description="Perbarui informasi produk dan stok." />
      <ProductForm initialData={data} endpoint={`/api/products/${params.id}`} />
    </div>
  );
}
