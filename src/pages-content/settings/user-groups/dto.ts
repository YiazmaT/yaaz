export interface CreateUserGroupDto {
  name: string;
  description: string | null;
  permissions: {module: string; action: string}[];
}

export interface UpdateUserGroupDto {
  id: string;
  name: string;
  description: string | null;
  permissions: {module: string; action: string}[];
}

export interface DeleteUserGroupDto {
  id: string;
}
