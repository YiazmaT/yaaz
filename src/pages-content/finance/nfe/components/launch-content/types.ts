import {NfeItem} from "../../types";

export interface NfeLaunchContentProps {
  items: NfeItem[];
  mode?: "launch" | "delete";
}
