"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {MobileList} from "@/src/components/mobile-list";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {flexGenerator} from "@/src/utils/flex-generator";
import {User} from "../types";
import {Form} from "../components/form";
import {UsersFiltersComponent} from "../components/filters";
import {MobileViewProps} from "./types";
import {API_ROUTE} from "../use-users";

export function MobileView(props: MobileViewProps) {
  const {users} = props;
  const {translate} = useTranslate();

  function renderRow(item: User, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", gap: 2}}>
          <ImagePreview url={item.image} alt={item.name} width={52} height={52} borderRadius={50} />
          <Box sx={{...flexGenerator("c"), minWidth: 0, overflow: "hidden", flex: 1}}>
            <Typography variant="subtitle1" fontWeight={600}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.login}
            </Typography>
            <Box sx={{display: "flex", gap: 0.5, marginTop: 0.5, flexWrap: "wrap"}}>
              {item.owner && <Chip label={translate("users.owner")} size="small" color="warning" />}
              {!item.owner && item.admin && <Chip label={translate("users.admin")} size="small" color="primary" />}
              {!item.owner && !item.admin && <Chip label={translate("users.user")} size="small" />}
              {!item.active && <Chip label={translate("users.inactive")} size="small" color="error" />}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1,
            marginTop: 1,
            paddingTop: 1,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {!item.owner && item.active && (
            <Tooltip title={translate("global.actions.edit")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  users.handleEdit(item);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!item.owner && (
            <Tooltip title={translate(item.active ? "users.tooltipDeactivate" : "users.tooltipActivate")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  users.handleToggleActive(item);
                }}
              >
                {item.active ? (
                  <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                ) : (
                  <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
          {actions}
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<User>
        title="users.title"
        apiRoute={API_ROUTE}
        renderRow={renderRow}
        onView={users.handleView}
        filters={users.filters.showInactives ? {showInactives: "true"} : undefined}
        headerContent={<UsersFiltersComponent onFilterChange={users.handleFilterChange} />}
      />

      <Fab
        color="primary"
        size="small"
        onClick={users.handleCreate}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 20,
        }}
      >
        <AddIcon sx={{color: "white"}} />
      </Fab>

      <Form users={users} />
    </Box>
  );
}
