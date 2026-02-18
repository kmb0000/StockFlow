export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;

  quantity: number;
  selling_price: string;
  purchase_price: string;
  status: string;
  created_at: string;

  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;

  supplier_id: string | null;
  supplier_name: string | null;

  created_by_id: string | null;
  created_by_name: string | null;
  created_by_role: string | null;
}
