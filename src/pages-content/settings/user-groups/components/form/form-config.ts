import {buildDefaultPermissions, PermissionsMap} from "@/src/lib/permissions";
import * as yup from "yup";

export interface UserGroupFormValues {
  name: string;
  description: string;
  permissions: PermissionsMap;
}

export function useUserGroupFormConfig() {
  const schema = yup.object().shape({
    name: yup.string().required().label("Nome do Grupo"),
  });

  const defaultValues: UserGroupFormValues = {
    name: "",
    description: "",
    permissions: buildDefaultPermissions(),
  };

  return {schema, defaultValues};
}
