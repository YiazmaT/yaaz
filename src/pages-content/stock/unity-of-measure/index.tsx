"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {useUnityOfMeasure} from "./use-unity-of-measure";
import {DesktopView} from "./desktop";
import {MobileView} from "./mobile";

export function UnityOfMeasureScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const unityOfMeasure = useUnityOfMeasure();

  return isMobile ? <MobileView unityOfMeasure={unityOfMeasure} /> : <DesktopView unityOfMeasure={unityOfMeasure} />;
}
