import {Box, Button, Card, CardContent, Typography} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {SmallLoader} from "@/src/components/small-loader";
import {useTranslate} from "@/src/contexts/translation-context";
import {primaryColor} from "@/src/theme";
import {blackOrWhite} from "@/src/utils/black-or-white";
import {ReportCardProps} from "./types";

export function ReportCard(props: ReportCardProps) {
  const {translate} = useTranslate();

  return (
    <Card
      sx={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        borderRadius: 2,
        transition: "box-shadow 0.3s ease",
        "&:hover": {boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)"},
      }}
    >
      <CardContent sx={{p: 3}}>
        <Typography variant="h6" sx={{fontWeight: 600, mb: 3}}>
          {translate(props.title)}
        </Typography>

        {props.children}

        <Box sx={{mt: 3, display: "flex", justifyContent: "flex-end"}}>
          <Button
            variant="contained"
            onClick={props.onGenerate}
            disabled={props.isGenerating}
            startIcon={props.isGenerating ? <SmallLoader size={20} /> : <PlayArrowIcon sx={{color: blackOrWhite(primaryColor)}} />}
          >
            {translate("reports.generate")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
