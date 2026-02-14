export interface CreateBillDto {
  description: string;
  categoryId?: string;
  totalAmount: string;
  recurrenceType: string;
  recurrenceInterval?: string;
  recurrenceCount?: number;
  dueDate: string;
}

export interface UpdateBillDto {
  id: string;
  description: string;
  categoryId?: string;
}

export interface PayBillDto {
  installmentId: string;
  bankAccountId: string;
  paidDate: string;
}

export interface CancelPaymentDto {
  installmentId: string;
}
