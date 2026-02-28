import {AuthenticatedLayout} from "@/src/layouts/authenticated";

export default function Layout({children}: {children: React.ReactNode}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
