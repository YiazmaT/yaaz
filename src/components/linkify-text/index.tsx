import {Link, Typography} from "@mui/material";
import {LinkifyTextProps} from "./types";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function LinkifyText(props: LinkifyTextProps) {
  const {text, ...typographyProps} = props;
  const parts = text.split(URL_REGEX);

  return (
    <Typography {...typographyProps} sx={{whiteSpace: "pre-line", wordBreak: "break-word", ...typographyProps.sx}}>
      {parts.map((part, index) =>
        URL_REGEX.test(part) ? (
          <Link key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </Link>
        ) : (
          part
        ),
      )}
    </Typography>
  );
}
