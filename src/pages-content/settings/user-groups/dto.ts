export interface CreateUserGroupDto {
  name: string;
  description: string | null;
  permissions: {module: string; action: string; allowed: boolean}[];
}

export interface UpdateUserGroupDto {
  id: string;
  name: string;
  description: string | null;
  permissions: {module: string; action: string; allowed: boolean}[];
}

export interface DeleteUserGroupDto {
  id: string;
}
