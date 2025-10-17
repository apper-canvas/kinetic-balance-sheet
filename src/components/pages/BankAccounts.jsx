import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import StatCard from '@/components/molecules/StatCard';
import BankAccountModal from '@/components/organisms/BankAccountModal';
import ApperIcon from '@/components/ApperIcon';
import { bankAccountsService } from '@/services/api/bankAccountsService';
import { formatCurrency } from '@/utils/formatters';

const BankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountTypeFilter, setAccountTypeFilter] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [accounts, accountTypeFilter]);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bankAccountsService.getAll();
      setAccounts(data);
    } catch (err) {
      setError('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...accounts];

    if (accountTypeFilter) {
      filtered = filtered.filter(
        account => account.account_type_c === accountTypeFilter
      );
    }

    setFilteredAccounts(filtered);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    const result = await bankAccountsService.delete(accountId);
    
    if (result.success) {
      toast.success('Bank account deleted successfully');
      loadAccounts();
    } else {
      toast.error(result.message || 'Failed to delete bank account');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleAccountSaved = () => {
    loadAccounts();
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      'Checking': 'blue',
      'Savings': 'emerald',
      'Credit Card': 'amber',
      'Other': 'gray'
    };
    return colors[type] || 'gray';
  };

  const calculateStats = () => {
    const totalBalance = accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance_c) || 0), 0);
    const totalAccounts = accounts.length;
    const checkingBalance = accounts
      .filter(acc => acc.account_type_c === 'Checking')
      .reduce((sum, acc) => sum + (parseFloat(acc.balance_c) || 0), 0);
    const savingsBalance = accounts
      .filter(acc => acc.account_type_c === 'Savings')
      .reduce((sum, acc) => sum + (parseFloat(acc.balance_c) || 0), 0);

    return { totalBalance, totalAccounts, checkingBalance, savingsBalance };
  };

  if (loading) return <Loading type="card" count={4} />;
  if (error) return <Error message={error} onRetry={loadAccounts} />;

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Accounts</h1>
            <p className="text-gray-600 mt-1">Manage your bank accounts and balances</p>
          </div>
          <Button
            onClick={handleAddAccount}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            <span>Add Bank Account</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Balance"
            value={stats.totalBalance}
            icon="Wallet"
            gradient="from-emerald-500 to-teal-600"
            delay={0}
          />
          <StatCard
            title="Total Accounts"
            value={stats.totalAccounts}
            icon="CreditCard"
            gradient="from-blue-500 to-cyan-600"
            delay={0.1}
          />
          <StatCard
            title="Checking Balance"
            value={stats.checkingBalance}
            icon="Banknote"
            gradient="from-purple-500 to-pink-600"
            delay={0.2}
          />
          <StatCard
            title="Savings Balance"
            value={stats.savingsBalance}
            icon="PiggyBank"
            gradient="from-amber-500 to-orange-600"
            delay={0.3}
          />
        </div>

        <Card className="mb-6">
          <Card.Content className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <Select
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                  className="w-full"
                >
                  <option value="">All Types</option>
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              {accountTypeFilter && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setAccountTypeFilter('')}
                    className="w-full sm:w-auto"
                  >
                    Clear Filter
                  </Button>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {filteredAccounts.length === 0 ? (
          <Empty
            title="No bank accounts found"
            description={accountTypeFilter ? "Try adjusting your filters" : "Add your first bank account to get started"}
            actionLabel={!accountTypeFilter ? "Add Bank Account" : undefined}
            onAction={!accountTypeFilter ? handleAddAccount : undefined}
            icon="CreditCard"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account, index) => (
              <motion.div
                key={account.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <Card.Content className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {account.Name}
                        </h3>
                        <p className="text-sm text-gray-600">{account.bank_name_c}</p>
                      </div>
                      <Badge variant={getAccountTypeColor(account.account_type_c)}>
                        {account.account_type_c}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Account Number</span>
                        <span className="font-medium text-gray-900">
                          {account.account_number_c}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Currency</span>
                        <span className="font-medium text-gray-900">
                          {account.currency_c}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Balance</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {formatCurrency(account.balance_c)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                        className="flex-1 flex items-center justify-center space-x-2"
                      >
                        <ApperIcon name="Edit" className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.Id)}
                        className="flex-1 flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <BankAccountModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        account={editingAccount}
        onSaved={handleAccountSaved}
      />
    </div>
  );
};

export default BankAccounts;