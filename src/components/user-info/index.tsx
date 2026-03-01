import {Avatar, Box, Typography} from "@mui/material";
import {UserInfoProps} from "./types";

export function UserInfo(props: UserInfoProps) {
  const {user} = props;
  const size = props.imageSize ?? 32;
  const initial = user.name ? user.name[0].toUpperCase() : "?";

  return (
    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
      <Avatar src={user.image ?? undefined} alt={user.name ?? ""} sx={{width: size, height: size, fontSize: size * 0.4}}>
        {!user.image ? initial : undefined}
      </Avatar>
      <Box sx={{minWidth: 0}}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {user.name ?? "-"}
        </Typography>
        {user.login && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{display: "block"}}>
            {user.login}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
