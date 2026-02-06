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
import {Tenant} from "@/src/pages-content/tenants/types";
import {User} from "@/src/contexts/tenant-context";

interface ProvidersProps {
  children: React.ReactNode;
  initialTenant: Tenant | null;
  initialUser: User | null;
}

export function Providers({children, initialTenant, initialUser}: ProvidersProps) {
  return (
    <AppRouterCacheProvider>
      <TenantContextProvider initialTenant={initialTenant} initialUser={initialUser}>
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
