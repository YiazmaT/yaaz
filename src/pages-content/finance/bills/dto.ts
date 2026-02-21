export interface CreateBillDto {
  description: string;
  categoryId?: string;
  amount: string;
  installmentCount?: string;
  dueDate: string;
}

export interface UpdateBillDto {
  id: string;
  description: string;
  categoryId?: string;
  amount?: string;
  dueDate?: string;
}

export interface PayBillDto {
  billId: string;
  bankAccountId: string;
  paidDate: string;
}

export interface CancelPaymentDto {
  billId: string;
}
