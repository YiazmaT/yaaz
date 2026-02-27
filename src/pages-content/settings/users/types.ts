export interface User {
  id: string;
  name: string;
  login: string;
  admin: boolean;
  owner: boolean;
  active: boolean;
  image: string | null;
  create_date: string;
  last_edit_date: string | null;
}

export interface UsersFilters {
  showInactives?: boolean;
}

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  max_user_amount: number;
}
