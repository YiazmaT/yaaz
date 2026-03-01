"use client";
import {Avatar, Box, Tooltip} from "@mui/material";
import {UserAvatarStackProps} from "./types";

const MAX_VISIBLE = 10;

export function UserAvatarStack({users, total, size = 36}: UserAvatarStackProps) {
  const visible = users.slice(0, MAX_VISIBLE);
  const overflow = total - visible.length;

  if (total === 0) return null;

  return (
    <Box sx={{display: "flex", alignItems: "center"}}>
      {visible.map((user, i) => (
        <Tooltip
          key={user.id}
          placement="top"
          title={
            <>
              <span style={{display: "block", fontWeight: 600, fontSize: "0.9rem"}}>{user.name}</span>
              <span style={{display: "block", opacity: 0.8, fontSize: "0.8rem"}}>{user.login}</span>
            </>
          }
        >
          <Avatar
            src={user.image ?? undefined}
            alt={user.name}
            sx={{
              width: size,
              height: size,
              fontSize: size * 0.4,
              ml: i === 0 ? 0 : "-8px",
              border: "2px solid",
              borderColor: "background.paper",
              zIndex: MAX_VISIBLE - i,
              transition: "transform 0.2s ease, z-index 0s",
              "&:hover": {transform: "translateY(-6px)", zIndex: MAX_VISIBLE + 1},
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
      ))}
      {overflow > 0 && (
        <Tooltip title={`+${overflow} usuários`} placement="top">
          <Avatar
            sx={{
              width: size,
              height: size,
              fontSize: size * 0.38,
              ml: "-8px",
              border: "2px solid",
              borderColor: "background.paper",
              bgcolor: "grey.400",
              color: "white",
              zIndex: 0,
              transition: "transform 0.2s ease",
              "&:hover": {transform: "translateY(-6px)", zIndex: MAX_VISIBLE + 1},
            }}
          >
            +{overflow}
          </Avatar>
        </Tooltip>
      )}
    </Box>
  );
}
