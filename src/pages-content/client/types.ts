export interface ClientAddress {
  id: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface Client {
  id: string;
  code: number;
  name: string;
  description?: string;
  image: string | null;
  email?: string;
  phone?: string;
  cnpj?: string;
  cpf?: string;
  isCompany: boolean;
  active: boolean;
  address?: ClientAddress;
}

export interface ClientsFilters {
  showInactives?: boolean;
}
