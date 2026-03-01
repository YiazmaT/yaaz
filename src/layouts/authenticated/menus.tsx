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
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

export const yaazMenuItems: MenuItem[] = [{name: "yaaz.tenants", route: "/yaaz/tenants", icon: <StorefrontOutlinedIcon />}];

export const intranetMenuItems: MenuItem[] = [
  {name: "global.dashboard", route: "/dashboard", icon: <DashboardOutlinedIcon />, permission: {key: "dashboard", actions: ["read"]}},
  {name: "global.sales", route: "/sales", icon: <AttachMoneyIcon />, permission: {key: "sales", actions: ["read", "create", "edit", "delete"]}},
  {
    name: "global.finance",
    icon: <AccountBalanceWalletOutlinedIcon />,
    children: [
      {
        name: "finance.tabs.bills",
        route: "/finance/bills-to-pay",
        icon: <ReceiptLongOutlinedIcon />,
        permission: {key: "finance.bills", actions: ["read", "create", "edit", "delete"]},
      },
      {
        name: "finance.tabs.bank",
        route: "/finance/banks",
        icon: <AccountBalanceOutlinedIcon />,
        permission: {key: "finance.banks", actions: ["read", "create", "edit", "delete"]},
      },
      {
        name: "finance.tabs.categories",
        route: "/finance/categories",
        icon: <LabelOutlinedIcon />,
        permission: {key: "finance.categories", actions: ["read", "create", "edit", "delete"]},
      },
      {
        name: "finance.tabs.paymentMethod",
        route: "/finance/payment-method",
        icon: <CreditCardOutlinedIcon />,
        permission: {key: "finance.payment_method", actions: ["read", "create", "edit", "delete"]},
      },
      {
        name: "finance.tabs.nfe",
        route: "/finance/nfe",
        icon: <DescriptionOutlinedIcon />,
        permission: {key: "finance.nfe", actions: ["read", "create", "edit", "delete"]},
      },
    ],
  },
  {
    name: "global.stock",
    icon: <WidgetsOutlinedIcon />,
    children: [
      {
        name: "global.products",
        route: "/stock/products",
        icon: <Inventory2OutlinedIcon />,
        permission: {key: "stock.products", actions: ["read", "create", "edit", "delete"]},
      },
      {
        name: "global.ingredients",
        route: "/stock/ingredients",
        icon: <CategoryOutlinedIcon />,
        permission: {key: "stock.ingredients", actions: ["read", "create", "edit", "delete"]},
      },
      {
        name: "global.packages",
        route: "/stock/packages",
        icon: <TakeoutDiningOutlinedIcon />,
        permission: {key: "stock.packages", actions: ["read", "create", "edit", "delete"]},
      },
      {
        name: "global.unityOfMeasure",
        route: "/stock/unity-of-measure",
        icon: <StraightenOutlinedIcon />,
        permission: {key: "stock.unity_of_measure", actions: ["read", "create", "edit", "delete"]},
      },
    ],
  },
  {
    name: "global.clients",
    route: "/clients",
    icon: <PersonOutlineIcon />,
    permission: {key: "clients", actions: ["read", "create", "edit", "delete"]},
  },
  {name: "global.reports", route: "/reports", icon: <ReceiptOutlinedIcon />, permission: {key: "reports", actions: ["read"]}},
  {
    name: "global.settings",
    icon: <SettingsOutlinedIcon />,
    children: [
      {name: "settings.tabs.users", route: "/settings/users", icon: <PeopleOutlinedIcon />},
      {name: "settings.tabs.userGroups", route: "/settings/user-groups", icon: <GroupsOutlinedIcon />},
    ],
  },
];
