import {ImagePreview} from "@/src/components/image-preview";
import {ImagePreviewColumnProps} from "./types";

export function ImagePreviewColumn(props: ImagePreviewColumnProps) {
  return <ImagePreview url={props.image} alt={props.alt} width={40} height={40} borderRadius={1} />;
}
