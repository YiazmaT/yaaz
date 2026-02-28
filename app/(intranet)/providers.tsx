"use client";
import {QueryClientProvider} from "@tanstack/react-query";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";
import {LoaderContextProvider} from "@/src/contexts/loading-context";
import {AuthContextProvider} from "@/src/contexts/auth-context";
import {TenantContextProvider} from "@/src/contexts/tenant-context";
import {TranslationContextProvider} from "@/src/contexts/translation-context";
import {ToasterContextProvider} from "@/src/contexts/toast-context";
import {TopLoader} from "@/src/components/top-loader";
import {ConfirmModalContextProvider} from "@/src/contexts/confirm-modal-context";
import {TenantThemeProvider} from "@/src/components/tenant-theme-provider";
import {queryClient} from "@/src/lib/query-client";
import {Tenant} from "@/src/pages-content/tenants/types";
import {User, YaazUser} from "@/src/contexts/tenant-context";

interface ProvidersProps {
  children: React.ReactNode;
  initialTenant: Tenant | null;
  initialUser: User | null;
  initialYaazUser: YaazUser | null;
}

export function Providers({children, initialTenant, initialUser, initialYaazUser}: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <TenantContextProvider initialTenant={initialTenant} initialUser={initialUser} initialYaazUser={initialYaazUser}>
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
    </QueryClientProvider>
  );
}
