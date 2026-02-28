import {PropsWithChildren, ReactNode} from "react";
import {useYaazAuthenticatedLayout} from "./use-yaaz-authenticated-layout";

export interface MenuItem {
  name: string;
  route?: string;
  icon: ReactNode;
  children?: MenuItem[];
}

export interface MobileViewProps extends PropsWithChildren {
  layout: ReturnType<typeof useYaazAuthenticatedLayout>;
}

export interface DesktopViewProps extends PropsWithChildren {
  layout: ReturnType<typeof useYaazAuthenticatedLayout>;
}
