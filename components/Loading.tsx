import { Loader2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

type SpinnerSize = "sm" | "default" | "lg" | "xl";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  default: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12"
} as const;

const Spinner = ({ size = "xl", className = "" }: SpinnerProps) => {
  return (
    <div className="flex items-center justify-center">
      <Loader2 
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
};

export default Spinner;