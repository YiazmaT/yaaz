export interface SalesPerProductRawRow {
  product_id: string;
  code: number;
  name: string;
  image: string | null;
  sales_count: bigint;
  quantity_sold: string;
  revenue: string;
  profit: string;
}
