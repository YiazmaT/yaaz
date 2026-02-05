export interface Tenant {
  id: string;
  name: string;
  creation_date: Date;
  logo: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  time_zone: string;
  currency_type: string;
}
