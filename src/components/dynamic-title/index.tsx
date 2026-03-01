"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {useTenant} from "@/src/contexts/tenant-context";

const APP_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME!;

export function DynamicTitle() {
  const {tenant} = useTenant();
  const pathname = usePathname();

  useEffect(() => {
    document.title = tenant?.name ? `${APP_NAME} | ${tenant.name}` : APP_NAME;
  }, [tenant?.name, pathname]);

  return null;
}
