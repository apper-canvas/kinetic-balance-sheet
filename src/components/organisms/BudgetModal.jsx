import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import { budgetsService } from "@/services/api/budgetsService";
import { categoriesService } from "@/services/api/categoriesService";
import { getCurrentMonth } from "@/utils/formatters";

const BudgetModal = ({ isOpen, onClose, budget = null, onSave, selectedMonth = getCurrentMonth() }) => {
  const [formData, setFormData] = useState({
    category: "",
    monthlyLimit: "",
    month: selectedMonth
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesService.getByType("expense");
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (budget) {
      setFormData({
category_c: budget.category_c,
        monthly_limit_c: budget.monthly_limit_c.toString(),
        month: budget.month
      });
    } else {
      setFormData({
        category: "",
        monthlyLimit: "",
        month: selectedMonth
      });
    }
    setErrors({});
  }, [budget, isOpen, selectedMonth]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.monthlyLimit || parseFloat(formData.monthlyLimit) <= 0) {
      newErrors.monthlyLimit = "Budget amount must be greater than 0";
    }

    if (!formData.month) {
      newErrors.month = "Month is required";
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
      const budgetData = {
        ...formData,
        monthlyLimit: parseFloat(formData.monthlyLimit)
      };

      if (budget) {
await budgetsService.update(budget.Id, {
          category_c: budgetData.category_c,
          monthly_limit_c: parseFloat(budgetData.monthly_limit_c),
          month_c: budgetData.month_c
        });
        toast.success("Budget updated successfully!");
      } else {
        await budgetsService.upsert(budgetData.category, budgetData.month, budgetData.monthlyLimit);
        toast.success("Budget created successfully!");
      }

      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error("Failed to save budget. Please try again.");
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
      title={budget ? "Edit Budget" : "Create Budget"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Category"
          type="select"
          value={formData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
          error={errors.category}
          required
          disabled={!!budget}
        >
          <option value="">Select a category</option>
          {categories.map(category => (
<option key={category.Id} value={category.name_c}>
              {category.name}
            </option>
          ))}
        </FormField>

        <FormField
          label="Monthly Budget"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.monthlyLimit}
          onChange={(e) => handleInputChange("monthlyLimit", e.target.value)}
          error={errors.monthlyLimit}
          required
        />

        <FormField
          label="Month"
          type="month"
          value={formData.month}
          onChange={(e) => handleInputChange("month", e.target.value)}
          error={errors.month}
          required
          disabled={!!budget}
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
            {loading ? "Saving..." : budget ? "Update" : "Create"} Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetModal;