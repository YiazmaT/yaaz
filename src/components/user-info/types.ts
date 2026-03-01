import {User} from "@/src/pages-content/settings/users/types";

export interface UserInfoProps {
  user: Partial<User>;
  imageSize?: number;
}
