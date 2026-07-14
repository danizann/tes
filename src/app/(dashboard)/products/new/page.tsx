import Breadcrumb from "@/components/layout/Breadcrumb";
import { ProductForm } from "@/components/forms/ProductForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: "New" }]} />
      <PageHeader title="Add Product" description="Tambah produk baru ke katalog gudang." />
      <ProductForm endpoint="/api/products" />
    </div>
  );
}
