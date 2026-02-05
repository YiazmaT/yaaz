"use client";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";
import {LoaderContextProvider} from "@/src/contexts/loading-context";
import {AuthContextProvider} from "@/src/contexts/auth-context";
import {TenantContextProvider} from "@/src/contexts/tenant-context";
import {TranslationContextProvider} from "@/src/contexts/translation-context";
import {ToasterContextProvider} from "@/src/contexts/toast-context";
import {TopLoader} from "@/src/components/top-loader";
import {ConfirmModalContextProvider} from "@/src/contexts/confirm-modal-context";
import {TenantThemeProvider} from "@/src/components/tenant-theme-provider";

export default function DefaultLayout({children}: {children: React.ReactNode}) {
  return (
    <AppRouterCacheProvider>
      <TenantContextProvider>
        <TenantThemeProvider>
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
        </TenantThemeProvider>
      </TenantContextProvider>
    </AppRouterCacheProvider>
  );
}
