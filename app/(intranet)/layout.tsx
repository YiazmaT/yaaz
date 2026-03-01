import {cookies} from "next/headers";
import {Providers} from "./providers";
import {Tenant} from "@/src/pages-content/yaaz/tenants/types";
import {User, YaazUser} from "@/src/contexts/tenant-context";
import {UserPermission} from "@/src/@types/global-types";

function parseCookie<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return null;
  }
}

export default async function DefaultLayout({children}: {children: React.ReactNode}) {
  const cookieStore = await cookies();
  const initialTenant = parseCookie<Tenant>(cookieStore.get("tenant")?.value);
  const initialUser = parseCookie<User>(cookieStore.get("user")?.value);
  const initialYaazUser = parseCookie<YaazUser>(cookieStore.get("yaaz_user")?.value);
  const initialPermissions = parseCookie<UserPermission[]>(cookieStore.get("user_permissions")?.value) ?? [];

  return (
    <Providers initialTenant={initialTenant} initialUser={initialUser} initialYaazUser={initialYaazUser} initialPermissions={initialPermissions}>
      {children}
    </Providers>
  );
}
