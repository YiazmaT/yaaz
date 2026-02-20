import {useNfe} from "../use-nfe";

export interface NfeModalProps {
  nfe: ReturnType<typeof useNfe>;
}

export interface ItemOption {
  id: string;
  name: string;
  code?: number;
  unit_of_measure?: string;
}