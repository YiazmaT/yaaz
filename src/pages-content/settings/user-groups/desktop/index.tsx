"use client";
import {Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {useTranslate} from "@/src/contexts/translation-context";
import {UserGroup} from "../types";
import {DesktopFormView} from "../components/form/desktop";
import {DesktopViewProps} from "./types";
import {API_ROUTE} from "../use-user-groups";

export function DesktopView(props: DesktopViewProps) {
  const {userGroups} = props;
  const {translate} = useTranslate();

  return (
    <>
      <ScreenCard title="userGroups.title">
        <DataTable<UserGroup>
          apiRoute={API_ROUTE}
          columns={userGroups.generateConfig()}
          renderOpositeSearch={
            <Button variant="contained" onClick={userGroups.handleCreate}>
              {translate("global.include")}
            </Button>
          }
        />
      </ScreenCard>

      <DesktopFormView userGroups={userGroups} />
    </>
  );
}
