import {useClients} from "../use-clients";

export interface MobileViewProps {
  clients: ReturnType<typeof useClients>;
}
