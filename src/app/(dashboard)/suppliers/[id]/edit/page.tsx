"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupplierForm, type SupplierPayload } from "@/components/forms/SupplierForm";

export default function EditSupplierPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<SupplierPayload | null>(null);

  useEffect(() => {
    fetch(`/api/suppliers/${params.id}`).then((res) => res.json()).then((result) => setData({
      name: result.name,
      phone: result.phone,
      email: result.email,
      address: result.address,
      notes: result.notes,
    }));
  }, [params.id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Suppliers", href: "/suppliers" }, { label: "Edit" }]} />
      <PageHeader title="Edit Supplier" description="Perbarui informasi supplier." />
      <SupplierForm initialData={data} endpoint={`/api/suppliers/${params.id}`} />
    </div>
  );
}
