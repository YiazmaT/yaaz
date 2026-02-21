import {usePackages} from "../use-packages";

export interface MobileViewProps {
  packages: ReturnType<typeof usePackages>;
}
