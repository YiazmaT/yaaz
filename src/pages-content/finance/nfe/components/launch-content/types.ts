export interface LaunchPreviewItem {
  id: string;
  item_type: "ingredient" | "product" | "package";
  name: string;
  image?: string | null;
  unity: string;
  stock: number;
  quantity: number;
}

export interface NfeLaunchContentProps {
  items: LaunchPreviewItem[];
  mode?: "launch" | "delete";
}
