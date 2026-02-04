export interface CreateTenantDto {
  name: string;
  logo?: File | null;
  primary_color?: string | null;
  secondary_color?: string | null;
}

export interface UpdateTenantDto extends CreateTenantDto {
  id: string;
}

export interface DeleteTenantDto {
  id: string;
}
