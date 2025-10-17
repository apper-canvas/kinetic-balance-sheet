import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import { savingsGoalsService } from "@/services/api/savingsGoalsService";

const SavingsGoalModal = ({ isOpen, onClose, goal = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
setFormData({
        name_c: goal.name_c,
        target_amount_c: goal.target_amount_c?.toString() ?? '',
        deadline: new Date(goal.deadline).toISOString().split("T")[0]
      });
    } else {
      // Default to 6 months from now
      const defaultDeadline = new Date();
      defaultDeadline.setMonth(defaultDeadline.getMonth() + 6);
      
      setFormData({
        name: "",
        targetAmount: "",
        deadline: defaultDeadline.toISOString().split("T")[0]
      });
    }
    setErrors({});
  }, [goal, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Goal name is required";
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target amount must be greater than 0";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate <= today) {
        newErrors.deadline = "Deadline must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        deadline: new Date(formData.deadline).toISOString()
      };

      if (goal) {
await savingsGoalsService.update(goal.Id, {
          name_c: goalData.name_c,
          target_amount_c: parseFloat(goalData.target_amount_c),
          deadline_c: goalData.deadline_c
        });
        toast.success("Savings goal updated successfully!");
      } else {
        await savingsGoalsService.create(goalData);
        toast.success("Savings goal created successfully!");
      }

      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error) {
      console.error("Error saving savings goal:", error);
      toast.error("Failed to save savings goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal ? "Edit Savings Goal" : "Create Savings Goal"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Goal Name"
          type="text"
          placeholder="e.g., Emergency Fund, Vacation, New Car..."
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          error={errors.name}
          required
        />

        <FormField
          label="Target Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.targetAmount}
          onChange={(e) => handleInputChange("targetAmount", e.target.value)}
          error={errors.targetAmount}
          required
        />

        <FormField
          label="Target Date"
          type="date"
          value={formData.deadline}
          onChange={(e) => handleInputChange("deadline", e.target.value)}
          error={errors.deadline}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Saving..." : goal ? "Update" : "Create"} Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SavingsGoalModal;