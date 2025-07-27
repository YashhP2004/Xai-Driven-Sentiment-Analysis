
import { Slider } from "@/components/ui/slider";

interface SliderDemoProps {
  label: string;
  defaultValue: number[];
  min: number;
  max: number;
  step: number;
  lowThreshold: number;
  highThreshold: number;
  inverted?: boolean;
}

export function SliderDemo({
  label,
  defaultValue,
  min,
  max,
  step,
  lowThreshold,
  highThreshold,
  inverted = false,
}: SliderDemoProps) {
  const value = defaultValue[0];
  
  const getColorClass = () => {
    if (inverted) {
      if (value > highThreshold) return "text-destructive";
      if (value > lowThreshold) return "text-yellow-500";
      return "text-secondary";
    } else {
      if (value < lowThreshold) return "text-destructive";
      if (value < highThreshold) return "text-yellow-500";
      return "text-secondary";
    }
  };
  
  const getLabelText = () => {
    if (inverted) {
      if (value > highThreshold) return "High Risk";
      if (value > lowThreshold) return "Moderate Risk";
      return "Low Risk";
    } else {
      if (value < lowThreshold) return "High Risk";
      if (value < highThreshold) return "Moderate Risk";
      return "Low Risk";
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{value}</span>
          <span className={`text-xs ${getColorClass()} px-2 py-0.5 rounded-full bg-muted`}>
            {getLabelText()}
          </span>
        </div>
      </div>
      <Slider
        defaultValue={defaultValue}
        max={max}
        min={min}
        step={step}
        className="cursor-default"
        disabled
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{inverted ? "Better" : "Worse"}</span>
        <span>{inverted ? "Worse" : "Better"}</span>
      </div>
    </div>
  );
}
