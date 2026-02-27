import {useUsers} from "../../use-users";

export interface FormProps {
  users: ReturnType<typeof useUsers>;
}
