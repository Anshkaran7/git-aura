import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-8 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(208,215,222,0.2)] transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
