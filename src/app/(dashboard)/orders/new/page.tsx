import Breadcrumb from "@/components/layout/Breadcrumb";
import { OrderForm } from "@/components/forms/OrderForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Orders", href: "/orders" }, { label: "New" }]} />
      <PageHeader title="Create Order" description="Buat order baru dan otomatis kurangi stok produk." />
      <OrderForm endpoint="/api/orders" />
    </div>
  );
}
