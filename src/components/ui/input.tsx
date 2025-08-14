import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`px-3 py-2 rounded-md border border-gray-700 bg-[#23272f] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
