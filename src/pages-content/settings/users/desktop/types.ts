import {useUsers} from "../use-users";

export interface DesktopViewProps {
  users: ReturnType<typeof useUsers>;
}

export interface UsersTableConfigProps {
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onToggleActive: (row: any) => void;
  onResendEmail: (row: any) => void;
  currentUserId: string | null;
}
