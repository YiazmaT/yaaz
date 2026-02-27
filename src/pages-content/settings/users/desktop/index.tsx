"use client";
import {Box, Button, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {useTranslate} from "@/src/contexts/translation-context";
import {User} from "../types";
import {Form} from "../components/form";
import {UsersFiltersComponent} from "../components/filters";
import {DesktopViewProps} from "./types";
import {API_ROUTE} from "../use-users";

export function DesktopView(props: DesktopViewProps) {
  const {users} = props;
  const {translate} = useTranslate();

  return (
    <>
      <ScreenCard title="users.title">
        <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
          <UsersFiltersComponent onFilterChange={users.handleFilterChange} />
          <Box sx={{flex: 1, minHeight: 0}}>
            <DataTable<User>
              apiRoute={API_ROUTE}
              columns={users.generateConfig()}
              filters={users.filters.showInactives ? {showInactives: "true"} : undefined}
              footerLeftContent={
                <Typography variant="body2" color="text.secondary">
                  {`${translate("users.userCount")}: ${users.totalUsers}/${users.maxUserAmount}`}
                </Typography>
              }
              renderOpositeSearch={
                <Button variant="contained" onClick={users.handleCreate}>
                  {translate("global.include")}
                </Button>
              }
            />
          </Box>
        </Box>
      </ScreenCard>

      <Form users={users} />
    </>
  );
}
