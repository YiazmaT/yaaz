import {TableConfigProps} from "@/src/@types/global-types";
import {Client} from "../types";
import {useClients} from "../use-clients";

export interface DesktopViewProps {
  clients: ReturnType<typeof useClients>;
}

export interface ClientsTableConfigProps extends TableConfigProps<Client> {
  onToggleActive: (row: Client) => void;
}
