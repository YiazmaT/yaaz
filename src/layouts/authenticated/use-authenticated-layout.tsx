"use client";
import {useState} from "react";
import {useTheme} from "@mui/material";
import {usePathname} from "next/navigation";
import {useNavigate} from "@/src/hooks/use-navigate";
import {useAuth, useYaazAuth} from "@/src/contexts/auth-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useTenant, usePermissions, useYaazUser} from "@/src/contexts/tenant-context";
import {MenuItem} from "./types";
import {intranetMenuItems, yaazMenuItems} from "./menus";

const DEFAULT_LOGO = "/assets/icon.png";
const DEFAULT_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "";

export function useAuthenticatedLayout() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const {logout: intranetLogout} = useAuth();
  const {logout: yaazLogout} = useYaazAuth();
  const {tenant, user} = useTenant();
  const {permissions} = usePermissions();
  const {yaazUser} = useYaazUser();
  const {navigate} = useNavigate();
  const {translate} = useTranslate();
  const theme = useTheme();
  const pathname = usePathname();

  const isYaaz = !!yaazUser && pathname.startsWith("/yaaz");
  const isAdmin = user?.admin || user?.owner;

  function filterMenuItems(items: MenuItem[]): MenuItem[] {
    if (isAdmin) return items;
    return items.reduce<MenuItem[]>((acc, item) => {
      if (item.children) {
        const visibleChildren = item.children.filter((child) => {
          if (!child.permission) return false;
          return permissions.some((p) => p.key === child.permission!.key && p.action === "read");
        });
        if (visibleChildren.length > 0) acc.push({...item, children: visibleChildren});
      } else {
        if (!item.permission) return acc;
        if (permissions.some((p) => p.key === item.permission!.key && p.action === "read")) acc.push(item);
      }
      return acc;
    }, []);
  }

  const menuItems = isYaaz ? yaazMenuItems : filterMenuItems(intranetMenuItems);
  const tenantLogo = isYaaz ? DEFAULT_LOGO : tenant?.logo || DEFAULT_LOGO;
  const tenantName = isYaaz ? DEFAULT_NAME : tenant?.name || DEFAULT_NAME;
  const homeRoute = isYaaz ? "/yaaz/tenants" : "/home";

  function logout() {
    if (isYaaz) yaazLogout();
    else intranetLogout();
  }

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
    homeRoute,
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
