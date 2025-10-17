import { cn } from "@/utils/cn";

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("p-6 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("p-6 pt-2", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("p-6 pt-2", className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;