import {PropsWithChildren, ReactNode} from "react";
import {useAuthenticatedLayout} from "./use-authenticated-layout";

export interface MenuItem {
  name: string;
  route?: string;
  icon: ReactNode;
  children?: MenuItem[];
}

export interface MobileViewProps extends PropsWithChildren {
  layout: ReturnType<typeof useAuthenticatedLayout>;
}

export interface DesktopViewProps extends PropsWithChildren {
  layout: ReturnType<typeof useAuthenticatedLayout>;
}
