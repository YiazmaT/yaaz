export interface CreateBankAccountDto {
  name: string;
  balance?: string;
}

export interface UpdateBankAccountDto {
  id: string;
  name: string;
}
