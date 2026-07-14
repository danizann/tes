"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { SellerForm, type SellerPayload } from "@/components/forms/SellerForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function EditSellerPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<SellerPayload | null>(null);

  useEffect(() => {
    fetch(`/api/sellers/${params.id}`).then((res) => res.json()).then((result) => setData({
      name: result.name,
      phone: result.phone,
      email: result.email,
      marketplace: result.marketplace,
      address: result.address,
      notes: result.notes,
    }));
  }, [params.id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Sellers", href: "/sellers" }, { label: "Edit" }]} />
      <PageHeader title="Edit Seller" description="Perbarui informasi seller." />
      <SellerForm initialData={data} endpoint={`/api/sellers/${params.id}`} />
    </div>
  );
}
