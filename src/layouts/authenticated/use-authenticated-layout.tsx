import {useState} from "react";
import {useTheme} from "@mui/material";
import {useNavigate} from "@/src/hooks/use-navigate";
import {useAuth} from "@/src/contexts/auth-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {MenuItem} from "./types";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import TakeoutDiningOutlinedIcon from "@mui/icons-material/TakeoutDiningOutlined";

const menuItems: MenuItem[] = [
  {name: "global.sales", route: "/intranet/sales", icon: <AttachMoneyIcon />},
  {name: "global.products", route: "/intranet/products", icon: <BakeryDiningOutlinedIcon />},
  {name: "global.ingredients", route: "/intranet/ingredients", icon: <CategoryOutlinedIcon />},
  {name: "global.packages", route: "/intranet/packages", icon: <TakeoutDiningOutlinedIcon />},
  {name: "global.reports", route: "/intranet/reports", icon: <ReceiptOutlinedIcon />},
];

export function useAuthenticatedLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {logout} = useAuth();
  const {navigate} = useNavigate();
  const {translate} = useTranslate();
  const theme = useTheme();

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
    toggleCollapse,
    handleMobileMenuToggle,
    handleNavigate,
    handleMobileNavigate,
    handleMobileLogout,
    logout,
  };
}
