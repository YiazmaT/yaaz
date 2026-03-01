import {User} from "@/src/pages-content/settings/users/types";

export interface UserAvatarStackProps {
  users: Partial<User>[];
  total: number;
  size?: number;
}
