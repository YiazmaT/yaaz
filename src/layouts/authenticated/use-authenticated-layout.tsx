import {useState} from "react";
import {useTheme} from "@mui/material";
import {useNavigate} from "@/src/hooks/use-navigate";
import {useAuth} from "@/src/contexts/auth-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useTenant} from "@/src/contexts/tenant-context";
import {MenuItem} from "./types";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import TakeoutDiningOutlinedIcon from "@mui/icons-material/TakeoutDiningOutlined";

const menuItems: MenuItem[] = [
  {name: "global.sales", route: "/sales", icon: <AttachMoneyIcon />},
  {name: "global.products", route: "/products", icon: <BakeryDiningOutlinedIcon />},
  {name: "global.ingredients", route: "/ingredients", icon: <CategoryOutlinedIcon />},
  {name: "global.packages", route: "/packages", icon: <TakeoutDiningOutlinedIcon />},
  {name: "global.reports", route: "/reports", icon: <ReceiptOutlinedIcon />},
];

const DEFAULT_LOGO = "/assets/icon.png";
const DEFAULT_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "";

export function useAuthenticatedLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {logout} = useAuth();
  const {tenant} = useTenant();
  const {navigate} = useNavigate();
  const {translate} = useTranslate();
  const theme = useTheme();

  const tenantLogo = tenant?.logo || DEFAULT_LOGO;
  const tenantName = tenant?.name || DEFAULT_NAME;

  function toggleCollapse() {
    setIsCollapsed(!isCollapsed);
  }

  function handleMobileMenuToggle() {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  function handleNavigate(route: string) {
    navigate(route);
  }

  function handleMobileNavigate(route: string) {
    navigate(route);
    setMobileMenuOpen(false);
  }

  function handleMobileLogout() {
    setMobileMenuOpen(false);
    logout();
  }

  return {
    isCollapsed,
    mobileMenuOpen,
    menuItems,
    theme,
    translate,
    tenantLogo,
    tenantName,
    toggleCollapse,
    handleMobileMenuToggle,
    handleNavigate,
    handleMobileNavigate,
    handleMobileLogout,
    logout,
  };
}
