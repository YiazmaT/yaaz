import {YaazAuthenticatedLayout} from "@/src/layouts/yaaz-authenticated";

export default function Layout({children}: {children: React.ReactNode}) {
  return <YaazAuthenticatedLayout>{children}</YaazAuthenticatedLayout>;
}
