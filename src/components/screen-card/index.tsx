import {Box, Button, Card, CardContent, Typography} from "@mui/material";
import {ScreenCardProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";

export function ScreenCard(props: ScreenCardProps) {
  const {translate} = useTranslate();

  return (
    <Box sx={{px: "30px", pt: "8px", pb: "30px", height: "100%"}}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          borderRadius: 2,
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <CardContent sx={{flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 3}}>
          <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexShrink: 0}}>
            <Typography variant="h5" sx={{fontWeight: 600}}>
              {translate(props.title)}
            </Typography>
            {props.includeButtonFunction && (
              <Button variant="contained" onClick={props.includeButtonFunction}>
                {translate("global.include")}
              </Button>
            )}
          </Box>
          <Box sx={{flex: 1, minHeight: 0, overflow: "hidden"}}>{props.children}</Box>
        </CardContent>
      </Card>
    </Box>
  );
}
