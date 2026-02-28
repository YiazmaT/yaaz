import {MenuItem} from "../../types";

export interface TopBarProps {
  menuItems: MenuItem[];
}

export interface FlatRoute {
  route: string;
  icon: React.ReactNode;
  labelKeys: string[];
}

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}
