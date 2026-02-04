"use client";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {Sale} from "../types";
import {Form} from "../components/form";
import {SalesFilters} from "../components/filters";
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {sales} = props;

  return (
    <>
      <ScreenCard title="sales.title" includeButtonFunction={sales.handleCreate}>
        <SalesFilters onFilterChange={sales.handleFilterChange} />
        <DataTable<Sale>
          key={sales.tableKey}
          apiRoute="/api/sale/paginated-list"
          columns={sales.generateConfig()}
          hideSearch
          filters={sales.filters}
        />
      </ScreenCard>

      <Form sales={sales} />
    </>
  );
}
