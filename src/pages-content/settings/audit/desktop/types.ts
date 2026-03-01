import {AuditLog} from "../types";
import {UseAuditReturn} from "../use-audit";

export interface DesktopViewProps {
  audit: UseAuditReturn;
}

export interface AuditTableConfigProps {
  onView: (row: AuditLog) => void;
}
