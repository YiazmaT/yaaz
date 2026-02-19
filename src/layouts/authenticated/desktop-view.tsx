import {Box, Button, Divider, IconButton, List, Tooltip, Typography} from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {flexGenerator} from "@/src/utils/flex-generator";
import {DesktopViewProps} from "./types";
import {MenuItems} from "./components/menu-items/menu-items";

export function DesktopView(props: DesktopViewProps) {
  const {layout, children} = props;

  return (
    <Box
      sx={{
        ...flexGenerator("r.flex-start.flex-start"),
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8f0f2 50%, #f0f4f8 100%)",
      }}
    >
      <Box sx={{...flexGenerator("c.flex-start.flex-start"), position: "relative"}}>
        <IconButton
          onClick={layout.toggleCollapse}
          size="small"
          sx={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translate(50%, -50%)",
            zIndex: 1000,
            backgroundColor: "white",
            border: `1px solid transparent`,
            backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${layout.theme.palette.divider}, ${layout.theme.palette.divider})`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${layout.theme.palette.primary.main}, ${layout.theme.palette.secondary.main})`,
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: layout.isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <ChevronRightIcon />
          </Box>
        </IconButton>
        <List
          sx={{
            height: "100vh",
            borderRight: `1px solid ${layout.theme.palette.divider}`,
            padding: 2,
            ...flexGenerator("c.center.space-between"),
            width: layout.isCollapsed ? "80px" : "250px",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
          }}
        >
          <Box sx={{width: "100%", flexShrink: 0}}>
            <Box
              sx={{
                ...flexGenerator("c.center.center"),
                flexShrink: 0,
                height: layout.isCollapsed ? "48px" : "80px",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Box
                component="img"
                alt={layout.tenantName}
                src={layout.tenantLogo}
                sx={{width: 48, height: 48, cursor: "pointer", objectFit: "contain"}}
                onClick={() => layout.handleNavigate("/dashboard")}
              />
              <Typography
                sx={{
                  marginTop: 1,
                  color: layout.theme.palette.primary.main,
                  textAlign: "center",
                  opacity: layout.isCollapsed ? 0 : 1,
                  height: layout.isCollapsed ? 0 : "auto",
                  overflow: "hidden",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  fontWeight: 600,
                }}
              >
                {layout.tenantName}
              </Typography>
            </Box>
            <Divider sx={{marginTop: "16px", marginBottom: "16px", flexShrink: 0}} />
            <MenuItems layout={layout} variant="desktop" />
          </Box>

          {layout.isCollapsed ? (
            <Tooltip title={layout.translate("global.exit")} placement="right" arrow>
              <IconButton
                onClick={layout.logout}
                sx={{
                  border: `1px solid transparent`,
                  backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${layout.theme.palette.divider}, ${layout.theme.palette.divider})`,
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${layout.theme.palette.primary.main}, ${layout.theme.palette.secondary.main})`,
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              onClick={layout.logout}
              sx={{
                ...flexGenerator("r.center"),
                gap: 0.5,
                width: "100%",
                border: `1px solid transparent`,
                backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${layout.theme.palette.divider}, ${layout.theme.palette.divider})`,
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${layout.theme.palette.primary.main}, ${layout.theme.palette.secondary.main})`,
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <ExitToAppIcon />
              {layout.translate("global.exit")}
            </Button>
          )}
        </List>
      </Box>
      <Box sx={{flex: 1, height: "100vh", overflow: "auto"}}>{children}</Box>
    </Box>
  );
}
