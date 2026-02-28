export interface CreateTenantDto {
  name: string;
  logo?: File | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  time_zone: string;
  currency_type: string;
}

export interface UpdateTenantDto extends CreateTenantDto {
  id: string;
}

export interface DeleteTenantDto {
  id: string;
}
