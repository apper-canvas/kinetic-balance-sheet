import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  message = "Something went wrong", 
  onRetry, 
  type = "default",
  showIcon = true 
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {showIcon && (
        <motion.div
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <ApperIcon name="AlertCircle" className="w-8 h-8 text-red-600" />
        </motion.div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {type === "network" ? "Connection Error" : "Error"}
      </h3>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={onRetry} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
        </motion.div>
      )}
      
      {type === "network" && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          Please check your internet connection and try again.
        </p>
      )}
    </motion.div>
  );
};

export default Error;