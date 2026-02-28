import {useYaazAuthenticatedLayout} from "../../use-yaaz-authenticated-layout";

export interface MenuItemsProps {
  layout: ReturnType<typeof useYaazAuthenticatedLayout>;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}
