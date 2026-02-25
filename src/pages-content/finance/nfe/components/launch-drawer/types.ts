import {LaunchPreviewItem} from "../launch-content/types";

export interface NfeLaunchDrawerProps {
  open: boolean;
  mode: "launch" | "delete";
  items: LaunchPreviewItem[];
  onConfirm: () => void;
  onClose: () => void;
}
