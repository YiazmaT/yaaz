export interface CreateClientDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  isCompany: boolean;
  image?: File | null;
}

export interface UpdateClientDto extends CreateClientDto {
  id: string;
}

export interface DeleteClientDto {
  id: string;
}
