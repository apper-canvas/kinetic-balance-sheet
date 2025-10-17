import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  disabled,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm hover:shadow-md",
    outline: "border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm hover:shadow-md"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm h-9",
    default: "px-4 py-2.5 text-sm h-10",
    lg: "px-6 py-3 text-base h-12"
  };

  return (
    <motion.button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed hover:transform-none",
        className
      )}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";

export default Button;