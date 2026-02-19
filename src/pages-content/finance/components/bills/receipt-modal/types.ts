import {Bill} from "../../../types";

export interface ReceiptModalProps {
  bill: Bill | null;
  onClose: () => void;
  onReceiptChange: () => void;
}
