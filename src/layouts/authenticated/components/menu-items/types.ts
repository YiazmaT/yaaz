import {useAuthenticatedLayout} from "../../use-authenticated-layout";

export interface MenuItemsProps {
  layout: ReturnType<typeof useAuthenticatedLayout>;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}
