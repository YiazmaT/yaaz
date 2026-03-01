import {AuditLog} from "../../types";

export interface DetailModalProps {
  log: AuditLog | null;
  onClose: () => void;
}
