import {Nfe} from "../../../types";

export interface NfeFileModalProps {
  nfe: Nfe | null;
  onClose: () => void;
  onFileChange: () => void;
}
