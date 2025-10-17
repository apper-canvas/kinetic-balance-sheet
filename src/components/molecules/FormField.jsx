import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  error, 
  type = "input", 
  className,
  children,
  required = false,
  ...props 
}) => {
  const renderField = () => {
    switch (type) {
      case "select":
        return <Select {...props}>{children}</Select>;
      case "textarea":
        return (
          <textarea
            className={cn(
              "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-none",
              props.className
            )}
            {...props}
          />
        );
      default:
        return <Input {...props} />;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;