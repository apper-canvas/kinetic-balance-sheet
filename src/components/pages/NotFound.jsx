import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 404 Illustration */}
        <motion.div
          className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.6,
            delay: 0.2,
            type: "spring",
            stiffness: 200
          }}
        >
          <ApperIcon name="AlertTriangle" className="w-16 h-16 text-white" />
        </motion.div>

        {/* Error Code */}
        <motion.h1
          className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          404
        </motion.h1>

        {/* Error Message */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Oops! The page you're looking for doesn't exist. It might have been moved, 
            deleted, or you entered the wrong URL.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <ApperIcon name="Home" className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          className="mt-12 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="mb-4">Need help? Try these links:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/transactions")}
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Transactions
            </button>
            <button
              onClick={() => navigate("/budgets")}
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Budgets
            </button>
            <button
              onClick={() => navigate("/goals")}
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Savings Goals
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Reports
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;