import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[104px] w-full resize-none rounded-[1.4rem] border border-border bg-card px-3.5 py-3 text-[13px] text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring/40",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
