export interface User {
  id: string;
  name: string;
  login: string;
  image: string | null;
}

export interface UserAvatarStackProps {
  users: User[];
  total: number;
  size?: number;
}
