import {Breakpoint} from "@mui/material";

export interface GenericModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  hideCloseButton?: boolean;
  maxWidth?: Breakpoint;
}
