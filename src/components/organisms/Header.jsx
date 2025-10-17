import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import TransactionModal from "@/components/organisms/TransactionModal";
import { useAuth } from "@/layouts/Root";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigation = [
    { name: "Dashboard", path: "/", icon: "LayoutDashboard" },
    { name: "Transactions", path: "/transactions", icon: "Receipt" },
    { name: "Budgets", path: "/budgets", icon: "Target" },
    { name: "Savings Goals", path: "/goals", icon: "TrendingUp" },
    { name: "Reports", path: "/reports", icon: "BarChart3" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isCurrentPath = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="PieChart" className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Balance Sheet
                </h1>
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item, index) => (
                <motion.button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isCurrentPath(item.path)
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ApperIcon name={item.icon} className="w-4 h-4" />
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </nav>

            {/* Actions */}
<div className="flex items-center space-x-3">
              <Button
                onClick={() => setIsTransactionModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                <span className="hidden sm:inline">Add Transaction</span>
              </Button>

              <Button
onClick={() => {
                  logout();
                }}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ApperIcon name="LogOut" className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden border-t border-gray-200 bg-white"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="py-4 space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isCurrentPath(item.path)
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <ApperIcon name={item.icon} className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
    </>
  );
};

export default Header;