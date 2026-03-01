"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {flexGenerator} from "@/src/utils/flex-generator";
import {UserGroup} from "../types";
import {MobileFormView} from "../components/form/mobile";
import {MobileViewProps} from "./types";
import {API_ROUTE} from "../use-user-groups";

export function MobileView(props: MobileViewProps) {
  const {userGroups} = props;
  const {translate} = useTranslate();

  function renderRow(item: UserGroup, _actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{...flexGenerator("sb"), gap: 1}}>
          <Box sx={{...flexGenerator("c"), minWidth: 0, flex: 1}}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {item.name}
            </Typography>
            {item.description && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {item.description}
              </Typography>
            )}
            <Chip label={`${item.user_count} ${translate("userGroups.fields.users")}`} size="small" sx={{mt: 0.5, alignSelf: "flex-start"}} />
          </Box>
          <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
            <Tooltip title={translate("global.actions.edit")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  userGroups.handleEdit(item);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={translate("global.actions.delete")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  userGroups.handleDelete(item);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<UserGroup> title="userGroups.title" apiRoute={API_ROUTE} renderRow={renderRow} onView={userGroups.handleView} />

      <Fab color="primary" size="small" onClick={userGroups.handleCreate} sx={{position: "fixed", bottom: 20, right: 20, zIndex: 20}}>
        <AddIcon sx={{color: "white"}} />
      </Fab>

      <MobileFormView userGroups={userGroups} />
    </Box>
  );
}
