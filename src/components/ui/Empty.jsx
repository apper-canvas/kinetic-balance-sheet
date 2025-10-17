import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "No data found", 
  description = "There's nothing to show here yet.", 
  onAction, 
  actionLabel = "Get Started",
  icon = "Inbox",
  type = "default"
}) => {
  const getEmptyConfig = () => {
    switch (type) {
      case "transactions":
        return {
          title: "No transactions yet",
          description: "Start tracking your finances by adding your first transaction.",
          icon: "Receipt",
          actionLabel: "Add Transaction",
          gradient: "from-emerald-50 to-teal-50"
        };
      case "budgets":
        return {
          title: "No budgets set",
          description: "Create your first budget to start managing your spending.",
          icon: "Target",
          actionLabel: "Create Budget",
          gradient: "from-blue-50 to-indigo-50"
        };
      case "goals":
        return {
          title: "No savings goals",
          description: "Set up savings goals to reach your financial targets.",
          icon: "TrendingUp",
          actionLabel: "Add Goal",
          gradient: "from-purple-50 to-pink-50"
        };
      default:
        return {
          title,
          description,
          icon,
          actionLabel,
          gradient: "from-gray-50 to-slate-50"
        };
    }
  };

  const config = getEmptyConfig();

  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-12 bg-gradient-to-br ${config.gradient} rounded-xl border border-gray-100`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          delay: 0.2, 
          type: "spring", 
          stiffness: 200,
          damping: 15
        }}
      >
        <ApperIcon name={config.icon} className="w-10 h-10 text-gray-400" />
      </motion.div>
      
      <motion.h3
        className="text-xl font-semibold text-gray-900 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {config.title}
      </motion.h3>
      
      <motion.p
        className="text-gray-600 text-center mb-8 max-w-md leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {config.description}
      </motion.p>
      
      {onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            onClick={onAction}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            {config.actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Empty;