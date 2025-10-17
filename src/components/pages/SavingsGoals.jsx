import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Modal from "@/components/molecules/Modal";
import SavingsGoalModal from "@/components/organisms/SavingsGoalModal";
import ApperIcon from "@/components/ApperIcon";
import { savingsGoalsService } from "@/services/api/savingsGoalsService";
import { formatCurrency, formatDate } from "@/utils/formatters";

const SavingsGoals = () => {
  const [data, setData] = useState({ goals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributionGoal, setContributionGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    setError("");

    try {
      const goals = await savingsGoalsService.getAll();
      setData({ goals });
    } catch (err) {
      console.error("Error loading savings goals:", err);
      setError("Failed to load savings goals");
    } finally {
      setLoading(false);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this savings goal?")) {
      return;
    }

    try {
      await savingsGoalsService.delete(goalId);
      toast.success("Savings goal deleted successfully!");
      loadGoals();
    } catch (error) {
      console.error("Error deleting savings goal:", error);
      toast.error("Failed to delete savings goal");
    }
  };

  const handleContributeToGoal = (goal) => {
    setContributionGoal(goal);
    setContributionAmount("");
    setIsContributionModalOpen(true);
  };

  const handleContributionSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await savingsGoalsService.addContribution(contributionGoal.Id, amount);
      toast.success(`$${amount.toFixed(2)} added to ${contributionGoal.name}!`);
      setIsContributionModalOpen(false);
      setContributionGoal(null);
      setContributionAmount("");
      loadGoals();
    } catch (error) {
      console.error("Error adding contribution:", error);
      toast.error("Failed to add contribution");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleGoalSaved = () => {
    loadGoals();
  };

  const getGoalStatus = (goal) => {
const progress = (goal.current_amount_c / goal.target_amount_c) * 100;
    const daysLeft = Math.ceil((new Date(goal.deadline_c) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (progress >= 100) {
      return { status: "Completed", color: "success", icon: "CheckCircle" };
    }
    
    if (daysLeft < 0) {
      return { status: "Overdue", color: "danger", icon: "AlertCircle" };
    }
    
    if (daysLeft < 30) {
      return { status: "Urgent", color: "warning", icon: "Clock" };
    }
    
    return { status: "On Track", color: "info", icon: "Target" };
  };

  const getDaysRemaining = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

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
        <Error message={error} onRetry={loadGoals} />
      </div>
    );
  }

  const totalTargetAmount = data.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = data.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

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
              <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
              <p className="text-gray-600 mt-1">
                Track your progress towards financial goals
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              <span>Add Goal</span>
            </Button>
          </div>
        </motion.div>

        {/* Overview */}
        {data.goals.length > 0 && (
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
                    <p className="text-sm font-medium text-gray-600">Total Target</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalTargetAmount)}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <ApperIcon name="PiggyBank" className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Saved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalCurrentAmount)}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ApperIcon name="TrendingUp" className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(overallProgress)}%
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        )}

        {/* Goals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {data.goals.length === 0 ? (
            <Empty 
              type="goals"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.goals.map((goal, index) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const daysRemaining = getDaysRemaining(goal.deadline);
                const { status, color, icon } = getGoalStatus(goal);
                
                return (
                  <motion.div
                    key={goal.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <Card.Header className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                            <ApperIcon name={icon} className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
{goal.name_c}
                            </h3>
                            <Badge variant={color}>
                              {status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContributeToGoal(goal)}
                            className="p-2"
                            disabled={progress >= 100}
                          >
                            <ApperIcon name="Plus" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                            className="p-2"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.Id)}
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
                              <p className="text-sm text-gray-600">Current Amount</p>
<p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(goal.current_amount_c)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Target</p>
<p className="text-lg font-semibold text-gray-700">
                                {formatCurrency(goal.target_amount_c)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${
                                  progress >= 100 ? "bg-emerald-500" :
                                  progress >= 75 ? "bg-emerald-500" :
                                  progress >= 50 ? "bg-amber-500" : "bg-red-500"
                                } h-2 rounded-full transition-all duration-500`}
                                style={{ 
                                  width: `${Math.min(progress, 100)}%` 
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">Deadline</p>
                              <p className="font-medium text-gray-900">
{formatDate(goal.deadline_c)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Days Left</p>
                              <p className={`font-medium ${
                                daysRemaining < 0 ? "text-red-600" :
                                daysRemaining < 30 ? "text-amber-600" : "text-emerald-600"
                              }`}>
                                {daysRemaining < 0 ? "Overdue" : `${daysRemaining} days`}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Remaining</span>
                            <span className="font-medium text-gray-900">
{formatCurrency(Math.max(0, goal.target_amount_c - goal.current_amount_c))}
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

      {/* Savings Goal Modal */}
      <SavingsGoalModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        goal={editingGoal}
        onSave={handleGoalSaved}
      />

      {/* Contribution Modal */}
      <Modal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
title={`Add Contribution to ${contributionGoal?.name_c}`}
        size="md"
      >
        <form onSubmit={handleContributionSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Contribution Amount
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              required
            />
          </div>

          {contributionGoal && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Current Amount</span>
                <span className="font-medium">
{formatCurrency(contributionGoal.current_amount_c)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">New Contribution</span>
                <span className="font-medium text-emerald-600">
                  +{formatCurrency(parseFloat(contributionAmount) || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-medium text-gray-900">New Total</span>
                <span className="font-bold text-gray-900">
{formatCurrency(contributionGoal.current_amount_c + (parseFloat(contributionAmount) || 0))}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsContributionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Contribution
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SavingsGoals;