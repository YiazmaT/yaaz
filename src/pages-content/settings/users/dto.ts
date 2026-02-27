export interface CreateUserDto {
  name: string;
  login: string;
  password: string;
  admin: boolean;
}

export interface UpdateUserDto {
  id: string;
  name: string;
  login: string;
  password?: string;
  admin: boolean;
  imageUrl?: string | null;
}

export interface DeleteUserDto {
  id: string;
}
