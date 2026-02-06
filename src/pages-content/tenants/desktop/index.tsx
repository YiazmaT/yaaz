"use client";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {Tenant} from "../types";
import {Form} from "../components/form";
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {tenants} = props;

  return (
    <>
      <ScreenCard title="tenants.title" includeButtonFunction={tenants.handleCreate}>
        <DataTable<Tenant> apiRoute="/api/tenant/paginated-list" columns={tenants.generateConfig()} />
      </ScreenCard>

      <Form tenants={tenants} imageSize={200} />
    </>
  );
}
