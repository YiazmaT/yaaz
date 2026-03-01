import {User} from "../users/types";

export interface UserGroup {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  user_count: number;
  users: User[];
  creation_date: string;
  last_edit_date: string | null;
}

export interface UserGroupPermission {
  module: string;
  action: string;
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
