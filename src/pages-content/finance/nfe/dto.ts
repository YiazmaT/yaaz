export interface NfeItemPayload {
  itemType: "ingredient" | "product" | "package";
  itemId: string;
  quantity: string;
  unitPrice: string;
}

export interface NfeCreatePayload {
  description: string;
  supplier?: string;
  nfeNumber: string;
  date: string;
  items: NfeItemPayload[];
  createBill?: boolean;
  addToStock?: boolean;
}

export interface NfeUpdatePayload extends NfeCreatePayload {
  id: string;
}
