import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import { bankAccountsService } from '@/services/api/bankAccountsService';

const BankAccountModal = ({ isOpen, onClose, account = null, onSaved }) => {
  const [formData, setFormData] = useState({
    Name: '',
    bank_name_c: '',
    account_number_c: '',
    account_type_c: 'Checking',
    currency_c: 'USD',
    balance_c: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account) {
      setFormData({
        Name: account.Name || '',
        bank_name_c: account.bank_name_c || '',
        account_number_c: account.account_number_c || '',
        account_type_c: account.account_type_c || 'Checking',
        currency_c: account.currency_c || 'USD',
        balance_c: account.balance_c || ''
      });
    } else {
      setFormData({
        Name: '',
        bank_name_c: '',
        account_number_c: '',
        account_type_c: 'Checking',
        currency_c: 'USD',
        balance_c: ''
      });
    }
    setErrors({});
  }, [account, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Name?.trim()) {
      newErrors.Name = 'Account name is required';
    }

    if (!formData.bank_name_c?.trim()) {
      newErrors.bank_name_c = 'Bank name is required';
    }

    if (!formData.account_number_c?.trim()) {
      newErrors.account_number_c = 'Account number is required';
    }

    if (!formData.account_type_c) {
      newErrors.account_type_c = 'Account type is required';
    }

if (!formData.currency_c?.trim()) {
      newErrors.currency_c = 'Currency is required';
    }

    if (String(formData.balance_c).trim() === '') {
      newErrors.balance_c = 'Balance is required';
    } else if (isNaN(parseFloat(formData.balance_c))) {
      newErrors.balance_c = 'Balance must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      const accountData = {
        Name: formData.Name.trim(),
        bank_name_c: formData.bank_name_c.trim(),
        account_number_c: formData.account_number_c.trim(),
        account_type_c: formData.account_type_c,
        currency_c: formData.currency_c.trim(),
        balance_c: parseFloat(formData.balance_c)
      };

      let result;
      if (account) {
        result = await bankAccountsService.update(account.Id, accountData);
      } else {
        result = await bankAccountsService.create(accountData);
      }

      if (result.success) {
        toast.success(account ? 'Bank account updated successfully' : 'Bank account added successfully');
        onSaved();
        onClose();
      } else {
        toast.error(result.message || 'Failed to save bank account');
      }
    } catch (error) {
      toast.error('An error occurred while saving the bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? 'Edit Bank Account' : 'Add Bank Account'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Account Name"
          error={errors.Name}
          required
        >
          <Input
            value={formData.Name}
            onChange={(e) => handleChange('Name', e.target.value)}
            placeholder="e.g., Personal Checking"
            disabled={loading}
          />
        </FormField>

        <FormField
          label="Bank Name"
          error={errors.bank_name_c}
          required
        >
          <Input
            value={formData.bank_name_c}
            onChange={(e) => handleChange('bank_name_c', e.target.value)}
            placeholder="e.g., Chase Bank"
            disabled={loading}
          />
        </FormField>

        <FormField
          label="Account Number"
          error={errors.account_number_c}
          required
        >
          <Input
            value={formData.account_number_c}
            onChange={(e) => handleChange('account_number_c', e.target.value)}
            placeholder="e.g., ****1234"
            disabled={loading}
          />
        </FormField>

        <FormField
          label="Account Type"
          error={errors.account_type_c}
          required
        >
          <Select
            value={formData.account_type_c}
            onChange={(e) => handleChange('account_type_c', e.target.value)}
            disabled={loading}
          >
            <option value="Checking">Checking</option>
            <option value="Savings">Savings</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Other">Other</option>
          </Select>
        </FormField>

        <FormField
          label="Currency"
          error={errors.currency_c}
          required
        >
          <Input
            value={formData.currency_c}
            onChange={(e) => handleChange('currency_c', e.target.value)}
            placeholder="e.g., USD"
            disabled={loading}
          />
        </FormField>

        <FormField
          label="Balance"
          error={errors.balance_c}
          required
        >
          <Input
            type="number"
            step="0.01"
            value={formData.balance_c}
            onChange={(e) => handleChange('balance_c', e.target.value)}
            placeholder="0.00"
            disabled={loading}
          />
        </FormField>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : account ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BankAccountModal;