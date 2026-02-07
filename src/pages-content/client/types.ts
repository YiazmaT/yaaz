export interface Client {
  id: string;
  name: string;
  image: string | null;
  email?: string;
  phone?: string;
  cnpj?: string;
  cpf?: string;
  isCompany: boolean;
}
