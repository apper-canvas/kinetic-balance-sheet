import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import BudgetModal from "@/components/organisms/BudgetModal";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import ApperIcon from "@/components/ApperIcon";
import { budgetsService } from "@/services/api/budgetsService";
import { transactionsService } from "@/services/api/transactionsService";
import { formatCurrency, getCurrentMonth, getMonthName } from "@/utils/formatters";

const Budgets = () => {
  const [data, setData] = useState({
    budgets: [],
    expenses: [],
    budgetData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth]);

  const loadBudgets = async () => {
    setLoading(true);
    setError("");

    try {
      const [budgets, expenses] = await Promise.all([
        budgetsService.getByMonth(selectedMonth),
        transactionsService.getByMonth(selectedMonth)
      ]);

      const expensesByCategory = expenses
.filter(t => t.type_c === "expense")
        .reduce((acc, expense) => {
acc[expense.category_c] = (acc[expense.category_c] || 0) + expense.amount_c;
          return acc;
        }, {});

      // Combine budget data with actual spending
      const budgetData = budgets.map(budget => ({
...budget,
        spent: expensesByCategory[budget.category_c] || 0,
        remaining: budget.monthly_limit_c - (expensesByCategory[budget.category_c] || 0),
        percentage: ((expensesByCategory[budget.category_c] || 0) / budget.monthly_limit_c) * 100
      }));

      setData({
        budgets,
        expenses: expenses.filter(t => t.type === "expense"),
        budgetData: budgetData.sort((a, b) => b.percentage - a.percentage)
      });
    } catch (err) {
      console.error("Error loading budgets:", err);
      setError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    try {
      await budgetsService.delete(budgetId);
      toast.success("Budget deleted successfully!");
      loadBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleBudgetSaved = () => {
    loadBudgets();
  };

  const getBudgetStatus = (percentage) => {
    if (percentage >= 100) return { color: "bg-red-500", status: "Over Budget" };
    if (percentage >= 75) return { color: "bg-amber-500", status: "Warning" };
    return { color: "bg-emerald-500", status: "On Track" };
  };

  // Generate month options (last 12 months and next 6 months)
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Past 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      options.push({
        value: monthKey,
        label: getMonthName(monthKey)
      });
    }

    // Next 6 months
    for (let i = 1; i <= 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      options.push({
        value: monthKey,
        label: getMonthName(monthKey)
      });
    }

    return options;
  };

  const monthOptions = getMonthOptions();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading type="cards" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message={error} onRetry={loadBudgets} />
      </div>
    );
  }

  const totalBudget = data.budgetData.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
  const totalSpent = data.budgetData.reduce((sum, budget) => sum + budget.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
              <p className="text-gray-600 mt-1">
                Manage your spending limits for {getMonthName(selectedMonth)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="min-w-[200px]"
              >
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                <span>Add Budget</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        {data.budgetData.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <Card.Content className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ApperIcon name="Target" className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalBudget)}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <ApperIcon name="CreditCard" className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalSpent)}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <ApperIcon name="Wallet" className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Remaining</p>
                    <p className={`text-2xl font-bold ${
                      totalBudget - totalSpent >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {formatCurrency(totalBudget - totalSpent)}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        )}

        {/* Budget List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {data.budgetData.length === 0 ? (
            <Empty 
              type="budgets"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.budgetData.map((budget, index) => {
                const { color, status } = getBudgetStatus(budget.percentage);
                
                return (
                  <motion.div
                    key={budget.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <Card.Header className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-3">
<CategoryBadge categoryName={budget.category_c} />
                          <span className={`text-sm font-medium ${
                            budget.percentage >= 100 ? "text-red-600" :
                            budget.percentage >= 75 ? "text-amber-600" : "text-emerald-600"
                          }`}>
                            {status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBudget(budget)}
                            className="p-2"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.Id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card.Header>
                      
                      <Card.Content>
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-sm text-gray-600">Spent</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(budget.spent)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Budget</p>
                              <p className="text-lg font-semibold text-gray-700">
                                {formatCurrency(budget.monthlyLimit)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {Math.round(budget.percentage)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${color} h-2 rounded-full transition-all duration-500`}
                                style={{ 
                                  width: `${Math.min(budget.percentage, 100)}%` 
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Remaining</span>
                            <span className={`font-medium ${
                              budget.remaining >= 0 ? "text-emerald-600" : "text-red-600"
                            }`}>
                              {formatCurrency(budget.remaining)}
                            </span>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        budget={editingBudget}
        onSave={handleBudgetSaved}
        selectedMonth={selectedMonth}
      />
    </>
  );
};

export default Budgets;