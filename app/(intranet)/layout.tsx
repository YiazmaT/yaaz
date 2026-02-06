import {cookies} from "next/headers";
import {Providers} from "./providers";
import {Tenant} from "@/src/pages-content/tenants/types";
import {User} from "@/src/contexts/tenant-context";

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

  return (
    <Providers initialTenant={initialTenant} initialUser={initialUser}>
      {children}
    </Providers>
  );
}
