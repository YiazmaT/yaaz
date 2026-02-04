"use client";
import {GlobalStyles, ThemeProvider} from "@mui/material";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";
import {globalStyles, themeMaterial} from "../../src/theme";
import {LoaderContextProvider} from "@/src/contexts/loading-context";
import {AuthContextProvider} from "@/src/contexts/auth-context";
import {TranslationContextProvider} from "@/src/contexts/translation-context";
import {ToasterContextProvider} from "@/src/contexts/toast-context";
import {TopLoader} from "@/src/components/top-loader";
import {ConfirmModalContextProvider} from "@/src/contexts/confirm-modal-context";

export default function DefaultLayout({children}: {children: React.ReactNode}) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={themeMaterial}>
        <GlobalStyles styles={globalStyles} />
        <TranslationContextProvider>
          <ConfirmModalContextProvider>
            <ToasterContextProvider>
              <LoaderContextProvider>
                <AuthContextProvider>
                  <TopLoader />
                  {children}
                </AuthContextProvider>
              </LoaderContextProvider>
            </ToasterContextProvider>
          </ConfirmModalContextProvider>
        </TranslationContextProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
