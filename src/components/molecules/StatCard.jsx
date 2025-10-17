import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency } from "@/utils/formatters";

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  gradient = "from-emerald-500 to-teal-600",
  delay = 0 
}) => {
  const formatValue = (val) => {
    if (typeof val === "number") {
      return formatCurrency(val);
    }
    return val;
  };

  const getChangeColor = () => {
    if (!changeType) return "text-gray-600";
    return changeType === "positive" ? "text-emerald-600" : "text-red-600";
  };

  const getChangeIcon = () => {
    if (!changeType) return null;
    return changeType === "positive" ? "TrendingUp" : "TrendingDown";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />
        <Card.Content className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            {icon && (
              <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10`}>
                <ApperIcon name={icon} className="w-4 h-4 text-emerald-600" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <motion.div
              className="text-3xl font-bold text-gray-900"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.2 }}
            >
              {formatValue(value)}
            </motion.div>
            
            {change && (
              <div className={`flex items-center space-x-1 text-sm ${getChangeColor()}`}>
                {getChangeIcon() && (
                  <ApperIcon name={getChangeIcon()} className="w-3 h-3" />
                )}
                <span>{change}</span>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </motion.div>
  );
};

export default StatCard;