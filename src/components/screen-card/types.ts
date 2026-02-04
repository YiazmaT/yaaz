import {ReactNode} from "react";

export interface ScreenCardProps {
  title: string;
  children: ReactNode;
  includeButtonFunction?: () => void;
}
