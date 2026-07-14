import Breadcrumb from "@/components/layout/Breadcrumb";
import { SellerForm } from "@/components/forms/SellerForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewSellerPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Sellers", href: "/sellers" }, { label: "New" }]} />
      <PageHeader title="Add Seller" description="Tambahkan seller atau kanal penjualan baru." />
      <SellerForm endpoint="/api/sellers" />
    </div>
  );
}
