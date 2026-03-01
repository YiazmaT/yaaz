import {User} from "../../settings/users/types";

export interface Tenant {
  id: string;
  name: string;
  creation_date: Date;
  logo: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  time_zone: string;
  currency_type: string;
  max_file_size_in_mbs: number;
  owner_user_id: string | null;
  owner: User | null;
}
