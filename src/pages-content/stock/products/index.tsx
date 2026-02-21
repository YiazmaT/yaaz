"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {useProducts} from "./use-products";
import {MobileView} from "./mobile";

export function ProductsScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const products = useProducts();

  if (isMobile) {
    return <MobileView products={products} />;
  }

  return <DesktopView products={products} />;
}
