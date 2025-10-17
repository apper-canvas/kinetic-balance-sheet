import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import TransactionModal from "@/components/organisms/TransactionModal";
import ApperIcon from "@/components/ApperIcon";
import { transactionsService } from "@/services/api/transactionsService";
import { categoriesService } from "@/services/api/categoriesService";
import { formatCurrency, formatDate } from "@/utils/formatters";

const Transactions = () => {
  const [data, setData] = useState({
    transactions: [],
    categories: [],
    filteredTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    type: "",
    dateFrom: "",
    dateTo: ""
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data.transactions, filters]);

  const loadTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const [transactions, categories] = await Promise.all([
        transactionsService.getAll(),
        categoriesService.getAll()
      ]);

      setData({
        transactions,
        categories,
        filteredTransactions: transactions
      });
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data.transactions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
t.description_c.toLowerCase().includes(searchLower) ||
        t.category_c.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
if (filters.category_c) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    setData(prev => ({ ...prev, filteredTransactions: filtered }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      type: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await transactionsService.delete(transactionId);
      toast.success("Transaction deleted successfully!");
      loadTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleTransactionSaved = () => {
    loadTransactions();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading type="list" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message={error} onRetry={loadTransactions} />
      </div>
    );
  }

  const hasActiveFilters = Object.values(filters).some(filter => filter !== "");

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
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-1">
                Showing {data.filteredTransactions.length} of {data.transactions.length} transactions
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              <span>Add Transaction</span>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="mb-6">
            <Card.Content className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <Input
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {data.categories.map(category => (
<option key={category.Id} value={category.name_c}>
                        {category.name_c}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </Select>
                </div>

                <div>
                  <Input
                    type="date"
                    placeholder="From date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    type="date"
                    placeholder="To date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  />
                </div>

                <div className="flex space-x-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex items-center space-x-2"
                    >
                      <ApperIcon name="X" className="w-4 h-4" />
                      <span>Clear</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {data.filteredTransactions.length === 0 ? (
            <Empty 
              type="transactions"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <Card>
              <Card.Content className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.filteredTransactions.map((transaction, index) => (
                        <motion.tr
                          key={transaction.Id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
<div className={`p-2 rounded-lg ${
                                transaction.type === "income" 
                                  ? "bg-emerald-100" 
                                  : "bg-red-100"
                              }`}>
<ApperIcon
                                  name={transaction.type === "income" ? "Plus" : "Minus"} 
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
                                  {transaction.description}
                                </p>
<p className="text-sm text-gray-500 capitalize">
                                  {formatDate(transaction.date_c)} • {transaction.category_c}
                                  {transaction.type}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
<CategoryBadge categoryName={transaction.category_c} />
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-semibold ${
transaction.type_c === "income" 
                                ? "text-emerald-600" 
                                : "text-red-600"
                            }`}>
                              {transaction.type_c === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount_c)}
                                ? "text-emerald-600" 
                                : "text-red-600"
                            }`}>
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTransaction(transaction)}
                                className="p-2"
                              >
                                <ApperIcon name="Edit2" className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTransaction(transaction.Id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Content>
            </Card>
          )}
        </motion.div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        transaction={editingTransaction}
        onSave={handleTransactionSaved}
      />
    </>
  );
};

export default Transactions;