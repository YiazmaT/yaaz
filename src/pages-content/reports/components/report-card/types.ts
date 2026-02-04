import {PropsWithChildren} from "react";

export interface ReportCardProps extends PropsWithChildren {
  title: string;
  isGenerating: boolean;
  onGenerate: () => void;
}
