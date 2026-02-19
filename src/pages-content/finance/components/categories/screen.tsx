"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {ScreenCard} from "@/src/components/screen-card";
import {CategoriesDesktop} from ".";
import {CategoriesMobile} from "./mobile";

export function CategoriesScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) return <CategoriesMobile />;

  return (
    <ScreenCard title="finance.categoriesTitle">
      <CategoriesDesktop />
    </ScreenCard>
  );
}
