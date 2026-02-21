import {usePackages} from "../../use-packages";

export interface FormProps {
  packages: ReturnType<typeof usePackages>;
  imageSize?: number;
}
