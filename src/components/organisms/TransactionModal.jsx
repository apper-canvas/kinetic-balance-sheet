import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import { transactionsService } from "@/services/api/transactionsService";
import { categoriesService } from "@/services/api/categoriesService";

const TransactionModal = ({ isOpen, onClose, transaction = null, onSave }) => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    type: "expense",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesService.getAll();
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
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        category: transaction.category,
        type: transaction.type,
        description: transaction.description,
        date: new Date(transaction.date).toISOString().split("T")[0]
      });
    } else {
      setFormData({
        amount: "",
        category: "",
        type: "expense",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  const filteredCategories = categories.filter(cat => 
    cat.type === formData.type || cat.name === "Other" || cat.name === "Other Income"
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
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
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      if (transaction) {
        await transactionsService.update(transaction.Id, transactionData);
        toast.success("Transaction updated successfully!");
      } else {
        await transactionsService.create(transactionData);
        toast.success("Transaction added successfully!");
      }

      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear category when type changes
    if (field === "type" && formData.category) {
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      if (selectedCategory && selectedCategory.type !== value) {
        setFormData(prev => ({ ...prev, [field]: value, category: "" }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? "Edit Transaction" : "Add Transaction"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Type"
            type="select"
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            error={errors.type}
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </FormField>

          <FormField
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            error={errors.amount}
            required
          />
        </div>

        <FormField
          label="Category"
          type="select"
          value={formData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
          error={errors.category}
          required
        >
          <option value="">Select a category</option>
          {filteredCategories.map(category => (
            <option key={category.Id} value={category.name}>
              {category.name}
            </option>
          ))}
        </FormField>

        <FormField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange("date", e.target.value)}
          error={errors.date}
          required
        />

        <FormField
          label="Description"
          type="textarea"
          placeholder="Enter transaction description..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          error={errors.description}
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
            {loading ? "Saving..." : transaction ? "Update" : "Add"} Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;