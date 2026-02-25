"use client";
import {Box, Skeleton} from "@mui/material";

export function TodaySalesCardSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" sx={{fontSize: "3rem", width: "65%"}} />
      <Box sx={{paddingTop: 1, marginTop: 1, borderTop: 1, borderColor: "divider"}}>
        <Skeleton variant="text" sx={{width: "75%"}} />
      </Box>
      <Skeleton variant="text" sx={{width: "75%"}} />
      <Skeleton variant="text" sx={{width: "75%"}} />
      <Skeleton variant="text" sx={{width: "75%"}} />
    </Box>
  );
}

export function ChartCardSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" width="100%" height={250} sx={{borderRadius: 1}} />
      <Box sx={{paddingTop: 1, marginTop: 1, borderTop: 1, borderColor: "divider"}}>
        <Skeleton variant="text" sx={{width: "70%"}} />
      </Box>
      <Skeleton variant="text" sx={{width: "70%"}} />
      <Skeleton variant="text" sx={{width: "70%"}} />
      <Skeleton variant="text" sx={{width: "70%"}} />
    </Box>
  );
}

export function AlertsCardSkeleton() {
  return (
    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
      <Skeleton variant="text" sx={{width: "55%", fontSize: "1rem"}} />
      <Skeleton variant="text" sx={{width: "100%"}} />
      <Skeleton variant="text" sx={{width: "100%"}} />
      <Box sx={{marginTop: 1}} />
      <Skeleton variant="text" sx={{width: "55%", fontSize: "1rem"}} />
      <Skeleton variant="text" sx={{width: "100%"}} />
      <Skeleton variant="text" sx={{width: "100%"}} />
      <Skeleton variant="text" sx={{width: "100%"}} />
    </Box>
  );
}
