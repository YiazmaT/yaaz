"use client";
import {useState} from "react";
import {useTheme} from "@mui/material";
import {usePathname} from "next/navigation";
import {useNavigate} from "@/src/hooks/use-navigate";
import {useAuth} from "@/src/contexts/auth-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useTenant} from "@/src/contexts/tenant-context";
import {MenuItem} from "./types";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import TakeoutDiningOutlinedIcon from "@mui/icons-material/TakeoutDiningOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";

const menuItems: MenuItem[] = [
  {name: "global.dashboard", route: "/dashboard", icon: <DashboardOutlinedIcon />},
  {name: "global.sales", route: "/sales", icon: <AttachMoneyIcon />},
  {
    name: "global.finance",
    icon: <AccountBalanceWalletOutlinedIcon />,
    children: [
      {name: "finance.tabs.bills", route: "/finance/bills-to-pay", icon: <ReceiptLongOutlinedIcon />},
      {name: "finance.tabs.bank", route: "/finance/banks", icon: <AccountBalanceOutlinedIcon />},
      {name: "finance.tabs.categories", route: "/finance/categories", icon: <LabelOutlinedIcon />},
      {name: "finance.tabs.paymentMethod", route: "/finance/payment-method", icon: <CreditCardOutlinedIcon />},
      {name: "finance.tabs.nfe", route: "/finance/nfe", icon: <DescriptionOutlinedIcon />},
    ],
  },
  {
    name: "global.stock",
    icon: <WidgetsOutlinedIcon />,
    children: [
      {name: "global.products", route: "/stock/products", icon: <Inventory2OutlinedIcon />},
      {name: "global.ingredients", route: "/stock/ingredients", icon: <CategoryOutlinedIcon />},
      {name: "global.packages", route: "/stock/packages", icon: <TakeoutDiningOutlinedIcon />},
      {name: "global.unityOfMeasure", route: "/stock/unity-of-measure", icon: <StraightenOutlinedIcon />},
    ],
  },
  {name: "global.clients", route: "/clients", icon: <PersonOutlineIcon />},
  {name: "global.reports", route: "/reports", icon: <ReceiptOutlinedIcon />},
  {
    name: "global.settings",
    icon: <SettingsOutlinedIcon />,
    children: [{name: "settings.tabs.users", route: "/settings/users", icon: <PeopleOutlinedIcon />}],
  },
];

const DEFAULT_LOGO = "/assets/icon.png";
const DEFAULT_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "";

export function useAuthenticatedLayout() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const {logout} = useAuth();
  const {tenant} = useTenant();
  const {navigate} = useNavigate();
  const {translate} = useTranslate();
  const theme = useTheme();
  const pathname = usePathname();

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

  function toggleExpandedMenu(menuName: string) {
    setExpandedMenu((prev) => (prev === menuName ? null : menuName));
  }

  function isMenuExpanded(item: MenuItem): boolean {
    if (expandedMenu === item.name) return true;
    if (item.children) {
      return item.children.some((child) => child.route && pathname.startsWith(child.route));
    }
    return false;
  }

  function isActiveRoute(route: string): boolean {
    return pathname === route || pathname.startsWith(route + "/");
  }

  return {
    isCollapsed,
    mobileMenuOpen,
    menuItems,
    theme,
    translate,
    tenantLogo,
    tenantName,
    pathname,
    toggleCollapse,
    handleMobileMenuToggle,
    handleNavigate,
    handleMobileNavigate,
    handleMobileLogout,
    logout,
    expandedMenu,
    toggleExpandedMenu,
    isMenuExpanded,
    isActiveRoute,
  };
}
