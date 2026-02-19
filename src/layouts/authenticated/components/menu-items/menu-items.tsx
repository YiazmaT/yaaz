import {Box, Collapse, ListItem, ListItemButton, ListItemIcon, ListItemText, SxProps, Theme, Tooltip} from "@mui/material";
import Link from "next/link";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {flexGenerator} from "@/src/utils/flex-generator";
import {MenuItem} from "../../types";
import {MenuItemsProps} from "./types";

export function MenuItems(props: MenuItemsProps) {
  const {layout, variant, onNavigate} = props;
  const isDesktop = variant === "desktop";

  const menuItemSx = isDesktop
    ? {
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        border: "1px solid transparent",
        backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${layout.theme.palette.divider}, ${layout.theme.palette.divider})`,
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        borderRadius: 1,
        marginBottom: "8px",
        flexShrink: 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${layout.theme.palette.primary.main}, ${layout.theme.palette.secondary.main})`,
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
        },
      }
    : {
        marginBottom: 1,
        borderRadius: 1,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        border: `1px solid ${layout.theme.palette.divider}`,
      };

  const activeSx = {
    position: "relative",
    overflow: "hidden",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: `linear-gradient(135deg, ${layout.theme.palette.primary.main}, ${layout.theme.palette.secondary.main})`,
    },
  };

  function renderItem(item: MenuItem) {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = layout.isMenuExpanded(item);

    if (hasChildren) {
      return (
        <Box key={item.name}>
          <Tooltip title={isDesktop && layout.isCollapsed ? layout.translate(item.name) : ""} placement="right" arrow>
            <ListItem sx={menuItemSx} disablePadding>
              <ListItemButton
                onClick={() => {
                  if (isDesktop && layout.isCollapsed) layout.toggleCollapse();
                  layout.toggleExpandedMenu(item.name);
                }}
                sx={{
                  ...flexGenerator("r.center.center"),
                  height: "48px",
                  paddingLeft: 2,
                  paddingRight: 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 24,
                    ...flexGenerator("r.center.center"),
                    marginRight: isDesktop && layout.isCollapsed ? 0 : 2,
                    transition: "margin 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={layout.translate(item.name)}
                  sx={{overflow: "hidden", whiteSpace: "nowrap", transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"}}
                />
                {(!isDesktop || !layout.isCollapsed) && (isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />)}
              </ListItemButton>
            </ListItem>
          </Tooltip>
          <Collapse in={isExpanded && (!isDesktop || !layout.isCollapsed)} timeout={300}>
            <Box sx={{pl: 2, mb: isDesktop ? 0 : 1}}>
              {item.children!.map((child) => {
                const childActive = layout.isActiveRoute(child.route!);
                const childSx = (
                  isDesktop
                    ? childActive
                      ? {...menuItemSx, ...activeSx}
                      : {...menuItemSx, boxShadow: "none"}
                    : {...menuItemSx, boxShadow: "none", marginBottom: 0.5, ...(childActive ? activeSx : {})}
                ) as SxProps<Theme>;
                return (
                  <Tooltip key={child.route} title={isDesktop && layout.isCollapsed ? layout.translate(child.name) : ""} placement="right" arrow>
                    <ListItem sx={childSx} disablePadding>
                      <ListItemButton
                        component={Link}
                        href={child.route!}
                        onClick={onNavigate}
                        sx={{
                          ...flexGenerator("r.center.center"),
                          height: "40px",
                          paddingLeft: 1.5,
                          paddingRight: 1.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 24,
                            ...flexGenerator("r.center.center"),
                            marginRight: 2,
                            "& .MuiSvgIcon-root": {fontSize: "1.2rem"},
                          }}
                        >
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={layout.translate(child.name)}
                          slotProps={{primary: {variant: "body2"}}}
                          sx={{overflow: "hidden", whiteSpace: "nowrap"}}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                );
              })}
            </Box>
          </Collapse>
        </Box>
      );
    }

    const isActive = layout.isActiveRoute(item.route!);

    return (
      <Tooltip key={item.route} title={isDesktop && layout.isCollapsed ? layout.translate(item.name) : ""} placement="right" arrow>
        <ListItem sx={{...menuItemSx, ...(isActive ? activeSx : {})} as SxProps<Theme>} disablePadding>
          <ListItemButton
            component={Link}
            href={item.route!}
            onClick={onNavigate}
            sx={{
              ...flexGenerator("r.center.center"),
              height: "48px",
              paddingLeft: 2,
              paddingRight: 2,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 24,
                ...flexGenerator("r.center.center"),
                marginRight: isDesktop && layout.isCollapsed ? 0 : 2,
                transition: "margin 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={layout.translate(item.name)}
              sx={{overflow: "hidden", whiteSpace: "nowrap", transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"}}
            />
          </ListItemButton>
        </ListItem>
      </Tooltip>
    );
  }

  return <>{layout.menuItems.map((item) => renderItem(item))}</>;
}
