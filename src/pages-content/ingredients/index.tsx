"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {useIngredients} from "./use-ingredients";
import {MobileView} from "./mobile";

export function IngredientsScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const ingredients = useIngredients();

  if (isMobile) {
    return <MobileView ingredients={ingredients} />;
  }

  return <DesktopView ingredients={ingredients} />;
}
