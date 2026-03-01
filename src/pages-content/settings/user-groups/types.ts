export interface UserGroup {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  user_count: number;
  creation_date: string;
  last_edit_date: string | null;
}

export interface UserGroupPermission {
  module: string;
  action: string;
  allowed: boolean;
}

export interface UserGroupDetail {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  permissions: UserGroupPermission[];
}

export interface UserGroupsListResponse {
  data: UserGroup[];
  total: number;
  page: number;
  limit: number;
}
