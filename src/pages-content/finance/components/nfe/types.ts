import {Nfe} from "../../types";

export interface NfeTableConfigProps {
  onEdit: (row: Nfe) => void;
  onDelete: (row: Nfe) => void;
  onViewFile: (row: Nfe) => void;
}
