import {useUsers} from "../use-users";

export interface MobileViewProps {
  users: ReturnType<typeof useUsers>;
}
