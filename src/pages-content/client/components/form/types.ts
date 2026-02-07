import {useClients} from "../../use-clients";

export interface FormProps {
  clients: ReturnType<typeof useClients>;
  imageSize?: number;
}
