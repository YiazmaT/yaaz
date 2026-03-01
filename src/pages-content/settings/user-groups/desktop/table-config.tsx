import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {UserAvatarStack} from "@/src/components/user-avatar-stack";
import {UserGroup} from "../types";

interface UserGroupsTableConfigProps {
  onView: (row: UserGroup) => void;
  onEdit: (row: UserGroup) => void;
  onDelete: (row: UserGroup) => void;
}

export function useUserGroupsTableConfig(props: UserGroupsTableConfigProps) {
  function generateConfig(): DataTableColumn<UserGroup>[] {
    return [
      {
        field: "name",
        headerKey: "userGroups.fields.name",
        width: "40%",
        render: (row) => row.name,
      },
      {
        field: "description",
        headerKey: "userGroups.fields.description",
        width: "35%",
        render: (row) => row.description || "-",
      },
      {
        field: "user_count",
        headerKey: "userGroups.fields.users",
        width: "220px",
        render: (row) => <UserAvatarStack users={row.users} total={row.user_count} />,
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "120px",
        align: "center",
        render: (row) => <ActionsColumn row={row} onView={props.onView} onEdit={props.onEdit} onDelete={props.onDelete} />,
      },
    ];
  }

  return {generateConfig};
}
