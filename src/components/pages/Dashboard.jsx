import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ExpensePieChart from "@/components/organisms/ExpensePieChart";
import IncomeExpenseChart from "@/components/organisms/IncomeExpenseChart";
import ApperIcon from "@/components/ApperIcon";
import { transactionsService } from "@/services/api/transactionsService";
import { savingsGoalsService } from "@/services/api/savingsGoalsService";
import { budgetsService } from "@/services/api/budgetsService";
import { formatCurrency, formatDate, getCurrentMonth } from "@/utils/formatters";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    transactions: [],
    savingsGoals: [],
    budgets: [],
    stats: {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      netSavings: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

try {
      const currentMonth = getCurrentMonth();
      const [allTransactions, savingsGoals, budgets] = await Promise.all([
        transactionsService.getAll(),
        savingsGoalsService.getAll(),
        budgetsService.getByMonth(currentMonth)
      ]);

      // Calculate stats
      const totalIncome = allTransactions
        .filter(t => t.type_c === "income")
        .reduce((sum, t) => sum + t.amount_c, 0);

      const totalExpenses = allTransactions
        .filter(t => t.type_c === "expense")
        .reduce((sum, t) => sum + t.amount_c, 0);

      const currentMonthTransactions = allTransactions.filter(t => 
        t.date_c.startsWith(currentMonth)
      );

      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type_c === "income")
        .reduce((sum, t) => sum + t.amount_c, 0);

      const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type_c === "expense")
        .reduce((sum, t) => sum + t.amount_c, 0);

      setData({
        transactions: allTransactions.slice(0, 5), // Recent 5 transactions
        savingsGoals: savingsGoals.slice(0, 3), // Top 3 goals
        budgets,
        stats: {
          totalBalance: totalIncome - totalExpenses,
          monthlyIncome,
          monthlyExpenses,
          netSavings: monthlyIncome - monthlyExpenses
        }
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading type="cards" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  const getChangeType = (current, previous) => {
    if (previous === 0) return null;
    return current > previous ? "positive" : "negative";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Balance"
          value={data.stats.totalBalance}
          icon="Wallet"
          gradient="from-emerald-500 to-teal-600"
          delay={0}
        />
        <StatCard
          title="Monthly Income"
          value={data.stats.monthlyIncome}
          icon="TrendingUp"
          gradient="from-blue-500 to-indigo-600"
          delay={0.1}
        />
        <StatCard
          title="Monthly Expenses"
          value={data.stats.monthlyExpenses}
          icon="TrendingDown"
          gradient="from-orange-500 to-red-600"
          delay={0.2}
        />
        <StatCard
          title="Net Savings"
          value={data.stats.netSavings}
          changeType={data.stats.netSavings > 0 ? "positive" : "negative"}
          icon="PiggyBank"
          gradient="from-purple-500 to-pink-600"
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ExpensePieChart />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <IncomeExpenseChart months={6} />
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <Card.Header className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/transactions")}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Content>
              {data.transactions.length === 0 ? (
                <Empty 
                  type="transactions" 
                  onAction={() => navigate("/transactions")}
                />
              ) : (
                <div className="space-y-4">
                  {data.transactions.map(transaction => (
                    <div
key={transaction.Id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type_c === "income" 
                            ? "bg-emerald-100" 
                            : "bg-red-100"
                        }`}>
                          <ApperIcon 
                            name={transaction.type_c === "income" ? "Plus" : "Minus"} 
                            className={`w-4 h-4 ${
                              transaction.type_c === "income" 
                                ? "text-emerald-600" 
                                : "text-red-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description_c}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.date_c)} • {transaction.category_c}
                          </p>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type_c === "income" 
                          ? "text-emerald-600" 
                          : "text-red-600"
                      }`}>
                        {transaction.type_c === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount_c)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>

        {/* Savings Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <Card.Header className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Savings Goals</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/goals")}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Content>
              {data.savingsGoals.length === 0 ? (
                <Empty 
                  type="goals" 
                  onAction={() => navigate("/goals")}
                />
              ) : (
                <div className="space-y-4">
                  {data.savingsGoals.map(goal => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    const progressColor = progress >= 75 ? "bg-emerald-500" : 
                                         progress >= 50 ? "bg-amber-500" : "bg-red-500";
                    
                    return (
<div key={goal.Id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{goal.name_c}</h4>
                          <Badge variant="info">
                            {Math.round(progress)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{formatCurrency(goal.current_amount_c)}</span>
                          <span>{formatCurrency(goal.target_amount_c)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;