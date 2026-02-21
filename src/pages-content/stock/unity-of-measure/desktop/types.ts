import {UnityOfMeasure} from "../types";
import {useUnityOfMeasure} from "../use-unity-of-measure";

export interface DesktopViewProps {
  unityOfMeasure: ReturnType<typeof useUnityOfMeasure>;
}

export interface UnityOfMeasureTableConfigProps {
  onEdit: (row: UnityOfMeasure) => void;
  onDelete: (row: UnityOfMeasure) => void;
  onToggleActive: (row: UnityOfMeasure) => void;
}
