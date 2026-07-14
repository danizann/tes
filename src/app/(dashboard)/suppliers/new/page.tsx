import Breadcrumb from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupplierForm } from "@/components/forms/SupplierForm";

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Suppliers", href: "/suppliers" }, { label: "New" }]} />
      <PageHeader title="Add Supplier" description="Tambahkan data pemasok baru ke sistem." />
      <SupplierForm endpoint="/api/suppliers" />
    </div>
  );
}
