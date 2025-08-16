import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`px-3 py-2 rounded-md border border-gray-700 bg-[#23272f] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px] w-full ${
          className || ""
        }`}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
