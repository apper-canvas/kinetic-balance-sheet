import { getApperClient } from '@/services/apperClient';

export const bankAccountsService = {
  async getAll(filters = {}) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'Name' } },
          { field: { Name: 'Tags' } },
          { field: { Name: 'account_number_c' } },
          { field: { Name: 'bank_name_c' } },
          { field: { Name: 'account_type_c' } },
          { field: { Name: 'currency_c' } },
          { field: { Name: 'balance_c' } }
        ],
        where: [],
        orderBy: [{ fieldName: 'Id', sorttype: 'DESC' }],
        pagingInfo: { limit: 100, offset: 0 }
      };

      if (filters.accountType) {
        params.where.push({
          FieldName: 'account_type_c',
          Operator: 'EqualTo',
          Values: [filters.accountType]
        });
      }

      const response = await apperClient.fetchRecords('bank_account_c', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching bank accounts:', error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'Name' } },
          { field: { Name: 'Tags' } },
          { field: { Name: 'account_number_c' } },
          { field: { Name: 'bank_name_c' } },
          { field: { Name: 'account_type_c' } },
          { field: { Name: 'currency_c' } },
          { field: { Name: 'balance_c' } }
        ]
      };

      const response = await apperClient.getRecordById('bank_account_c', id, params);

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching bank account ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(accountData) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        records: Array.isArray(accountData) ? accountData : [accountData]
      };

      const response = await apperClient.createRecord('bank_account_c', params);

      if (!response.success) {
        console.error(response.message);
        return { success: false, message: response.message };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} bank accounts:`, failed);
          return { 
            success: false, 
            message: failed[0]?.message || 'Failed to create bank account',
            errors: failed 
          };
        }

        const successful = response.results.filter(r => r.success);
        return { 
          success: true, 
          data: successful.map(r => r.data) 
        };
      }

      return { success: false, message: 'Unknown error occurred' };
    } catch (error) {
      console.error('Error creating bank account:', error?.response?.data?.message || error);
      return { 
        success: false, 
        message: error?.response?.data?.message || error.message || 'Failed to create bank account' 
      };
    }
  },

  async update(id, accountData) {
    try {
      const apperClient = getApperClient();
      
      const updateData = { Id: id, ...accountData };
      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('bank_account_c', params);

      if (!response.success) {
        console.error(response.message);
        return { success: false, message: response.message };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update bank account:`, failed);
          return { 
            success: false, 
            message: failed[0]?.message || 'Failed to update bank account',
            errors: failed 
          };
        }

        const successful = response.results.filter(r => r.success);
        return { 
          success: true, 
          data: successful[0]?.data 
        };
      }

      return { success: false, message: 'Unknown error occurred' };
    } catch (error) {
      console.error('Error updating bank account:', error?.response?.data?.message || error);
      return { 
        success: false, 
        message: error?.response?.data?.message || error.message || 'Failed to update bank account' 
      };
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        RecordIds: Array.isArray(id) ? id : [id]
      };

      const response = await apperClient.deleteRecord('bank_account_c', params);

      if (!response.success) {
        console.error(response.message);
        return { success: false, message: response.message };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete bank account:`, failed);
          return { 
            success: false, 
            message: failed[0]?.message || 'Failed to delete bank account' 
          };
        }

        return { success: true };
      }

      return { success: false, message: 'Unknown error occurred' };
    } catch (error) {
      console.error('Error deleting bank account:', error?.response?.data?.message || error);
      return { 
        success: false, 
        message: error?.response?.data?.message || error.message || 'Failed to delete bank account' 
      };
    }
  }
};