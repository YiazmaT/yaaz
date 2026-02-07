"use client";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {Client} from "../types";
import {Form} from "../components/form";
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {clients} = props;

  return (
    <>
      <ScreenCard title="clients.title" includeButtonFunction={clients.handleCreate}>
        <DataTable<Client>
          apiRoute="/api/client/paginated-list"
          columns={clients.generateConfig()}
        />
      </ScreenCard>

      <Form clients={clients} imageSize={200} />
    </>
  );
}
