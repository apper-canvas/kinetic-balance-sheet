import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ExpensePieChart from "@/components/organisms/ExpensePieChart";
import IncomeExpenseChart from "@/components/organisms/IncomeExpenseChart";
import StatCard from "@/components/molecules/StatCard";
import ApperIcon from "@/components/ApperIcon";
import { transactionsService } from "@/services/api/transactionsService";
import { formatCurrency, getCurrentMonth, getMonthName } from "@/utils/formatters";

const Reports = () => {
  const [data, setData] = useState({
    transactions: [],
    monthlyData: {},
    categoryBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [reportType, setReportType] = useState("monthly"); // monthly, yearly

  useEffect(() => {
    loadReportData();
  }, [selectedMonth, reportType]);

  const loadReportData = async () => {
    setLoading(true);
    setError("");

    try {
      let transactions;
      
      if (reportType === "monthly") {
        transactions = await transactionsService.getByMonth(selectedMonth);
      } else {
        // Get all transactions for the year
        const year = selectedMonth.split("-")[0];
        const allTransactions = await transactionsService.getAll();
        transactions = allTransactions.filter(t => t.date.startsWith(year));
      }

      // Calculate monthly statistics
      const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const netIncome = income - expenses;
      const savingsRate = income > 0 ? (netIncome / income) * 100 : 0;

      // Category breakdown
      const categoryTotals = {};
      transactions
        .filter(t => t.type === "expense")
        .forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

      const categoryBreakdown = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: expenses > 0 ? (amount / expenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);

      setData({
        transactions,
        monthlyData: {
          income,
          expenses,
          netIncome,
          savingsRate,
          transactionCount: transactions.length
        },
        categoryBreakdown
      });
    } catch (err) {
      console.error("Error loading report data:", err);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  // Generate time period options
  const getTimeOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    if (reportType === "monthly") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        options.push({
          value: monthKey,
          label: getMonthName(monthKey)
        });
      }
    } else {
      // Last 3 years
      for (let i = 2; i >= 0; i--) {
        const year = currentDate.getFullYear() - i;
        options.push({
          value: `${year}-01`,
          label: year.toString()
        });
      }
    }

    return options;
  };

  const timeOptions = getTimeOptions();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading type="chart" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message={error} onRetry={loadReportData} />
      </div>
    );
  }

  const getPeriodLabel = () => {
    if (reportType === "yearly") {
      return selectedMonth.split("-")[0];
    }
    return getMonthName(selectedMonth);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-1">
              Detailed analysis of your financial activity for {getPeriodLabel()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="min-w-[120px]"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="min-w-[200px]"
            >
              {timeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </motion.div>

      {data.transactions.length === 0 ? (
        <Empty type="transactions" />
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Income"
              value={data.monthlyData.income}
              icon="TrendingUp"
              gradient="from-emerald-500 to-teal-600"
              delay={0}
            />
            <StatCard
              title="Total Expenses"
              value={data.monthlyData.expenses}
              icon="TrendingDown"
              gradient="from-red-500 to-pink-600"
              delay={0.1}
            />
            <StatCard
              title="Net Income"
              value={data.monthlyData.netIncome}
              changeType={data.monthlyData.netIncome >= 0 ? "positive" : "negative"}
              icon="DollarSign"
              gradient="from-blue-500 to-indigo-600"
              delay={0.2}
            />
            <StatCard
              title="Savings Rate"
              value={`${Math.round(data.monthlyData.savingsRate)}%`}
              icon="PiggyBank"
              gradient="from-purple-500 to-indigo-600"
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
              <ExpensePieChart month={selectedMonth} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <IncomeExpenseChart months={reportType === "yearly" ? 12 : 6} />
            </motion.div>
          </div>

          {/* Category Breakdown */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {/* Category Spending */}
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">
                  Spending by Category
                </h3>
              </Card.Header>
              <Card.Content>
                {data.categoryBreakdown.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No expenses to display</p>
                ) : (
                  <div className="space-y-4">
                    {data.categoryBreakdown.map((category, index) => (
                      <motion.div
                        key={category.category}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="font-medium text-gray-900">
                            {category.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(category.amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Math.round(category.percentage)}%
                            </div>
                          </div>
                          <div className="w-20">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${category.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Summary Stats */}
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">
                  Financial Summary
                </h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <ApperIcon name="TrendingUp" className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Average Daily Income</p>
                        <p className="text-sm text-gray-600">
                          {reportType === "monthly" ? "This month" : "This year"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-emerald-600">
                      {formatCurrency(
                        data.monthlyData.income / (reportType === "monthly" ? 30 : 365)
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <ApperIcon name="TrendingDown" className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Average Daily Spending</p>
                        <p className="text-sm text-gray-600">
                          {reportType === "monthly" ? "This month" : "This year"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(
                        data.monthlyData.expenses / (reportType === "monthly" ? 30 : 365)
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ApperIcon name="Receipt" className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Total Transactions</p>
                        <p className="text-sm text-gray-600">
                          {reportType === "monthly" ? "This month" : "This year"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-600">
                      {data.monthlyData.transactionCount}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-lg ${
                    data.monthlyData.savingsRate >= 20 ? "bg-green-50" :
                    data.monthlyData.savingsRate >= 10 ? "bg-yellow-50" : "bg-red-50"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        data.monthlyData.savingsRate >= 20 ? "bg-green-100" :
                        data.monthlyData.savingsRate >= 10 ? "bg-yellow-100" : "bg-red-100"
                      }`}>
                        <ApperIcon name="PiggyBank" className={`w-5 h-5 ${
                          data.monthlyData.savingsRate >= 20 ? "text-green-600" :
                          data.monthlyData.savingsRate >= 10 ? "text-yellow-600" : "text-red-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Savings Rate</p>
                        <p className="text-sm text-gray-600">
                          {data.monthlyData.savingsRate >= 20 ? "Excellent!" :
                           data.monthlyData.savingsRate >= 10 ? "Good progress" : "Needs improvement"}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xl font-bold ${
                      data.monthlyData.savingsRate >= 20 ? "text-green-600" :
                      data.monthlyData.savingsRate >= 10 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {Math.round(data.monthlyData.savingsRate)}%
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Reports;