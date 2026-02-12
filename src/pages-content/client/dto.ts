export interface ClientAddressDto {
  cep?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}

export interface CreateClientDto {
  name: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  isCompany: boolean;
  image?: File | null;
  address?: ClientAddressDto;
}

export interface UpdateClientDto extends CreateClientDto {
  id: string;
}

export interface DeleteClientDto {
  id: string;
}
