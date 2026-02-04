import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import {flexGenerator} from "@/src/utils/flex-generator";
import {MobileViewProps} from "./types";

export function MobileView(props: MobileViewProps) {
  const {layout, children} = props;

  return (
    <Box sx={{width: "100%", height: "100vh", display: "flex", flexDirection: "column", overflowX: "hidden"}}>
      <AppBar position="static" sx={{backgroundColor: "white", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"}}>
        <Toolbar sx={{justifyContent: "space-between"}}>
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            <Box
              component="img"
              alt={process.env.NEXT_PUBLIC_COMPANY_NAME!}
              src="/assets/icon.png"
              sx={{width: 32, height: 32, cursor: "pointer"}}
              onClick={() => layout.handleNavigate("/intranet/home")}
            />
            <Typography sx={{color: layout.theme.palette.primary.main, fontWeight: 600}}>{process.env.NEXT_PUBLIC_COMPANY_NAME}</Typography>
          </Box>
          <IconButton onClick={layout.handleMobileMenuToggle} sx={{color: layout.theme.palette.primary.main}}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={layout.mobileMenuOpen} onClose={layout.handleMobileMenuToggle} PaperProps={{sx: {width: "80%", maxWidth: 300}}}>
        <Box sx={{...flexGenerator("c.flex-start.flex-start"), height: "100%", padding: 2}}>
          <Box sx={{...flexGenerator("r.center.space-between"), width: "100%", marginBottom: 2}}>
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              <Box
                component="img"
                alt={process.env.NEXT_PUBLIC_COMPANY_NAME!}
                src="/assets/icon.png"
                sx={{width: 32, height: 32, cursor: "pointer"}}
                onClick={() => {
                  layout.handleNavigate("/intranet/home");
                  layout.handleMobileMenuToggle();
                }}
              />
              <Typography variant="h6" sx={{color: layout.theme.palette.primary.main, fontWeight: 600}}>
                {layout.translate("global.menu")}
              </Typography>
            </Box>
            <IconButton onClick={layout.handleMobileMenuToggle}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{width: "100%", marginBottom: 2}} />

          <Box sx={{flex: 1, width: "100%"}}>
            {layout.menuItems.map((item) => (
              <ListItem
                key={item.route}
                disablePadding
                sx={{
                  marginBottom: 1,
                  borderRadius: 1,
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  border: `1px solid ${layout.theme.palette.divider}`,
                }}
              >
                <ListItemButton onClick={() => layout.handleMobileNavigate(item.route)}>
                  <ListItemIcon sx={{minWidth: 40}}>{item.icon}</ListItemIcon>
                  <ListItemText primary={layout.translate(item.name)} />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>

          <Button
            variant="outlined"
            onClick={layout.handleMobileLogout}
            fullWidth
            sx={{
              ...flexGenerator("r.center.center"),
              gap: 1,
              border: `1px solid ${layout.theme.palette.divider}`,
            }}
          >
            <ExitToAppIcon />
            {layout.translate("global.exit")}
          </Button>
        </Box>
      </Drawer>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8f0f2 50%, #f0f4f8 100%)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
