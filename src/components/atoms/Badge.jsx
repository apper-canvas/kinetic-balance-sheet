import { cn } from "@/utils/cn";

const Badge = ({ className, variant = "default", children, color, ...props }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800"
  };

  const customStyle = color ? {
    backgroundColor: `${color}15`,
    color: color,
    borderColor: `${color}30`
  } : {};

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        color ? "border-opacity-30" : variants[variant],
        className
      )}
      style={customStyle}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;