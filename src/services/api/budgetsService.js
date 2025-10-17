import { getApperClient } from "@/services/apperClient";

const TABLE_NAME = "budget_c";

export const budgetsService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(TABLE_NAME, {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "category_c" } },
          { field: { Name: "monthly_limit_c" } },
          { field: { Name: "month_c" } }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "category_c" } },
          { field: { Name: "monthly_limit_c" } },
          { field: { Name: "month_c" } }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error("Budget not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      throw new Error("Budget not found");
    }
  },

  async getByMonth(month) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(TABLE_NAME, {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "category_c" } },
          { field: { Name: "monthly_limit_c" } },
          { field: { Name: "month_c" } }
        ],
        where: [
          {
            FieldName: "month_c",
            Operator: "EqualTo",
            Values: [month]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching budgets by month:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getByCategory(category, month) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(TABLE_NAME, {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "category_c" } },
          { field: { Name: "monthly_limit_c" } },
          { field: { Name: "month_c" } }
        ],
        where: [
          {
            FieldName: "category_c",
            Operator: "EqualTo",
            Values: [category]
          },
          {
            FieldName: "month_c",
            Operator: "EqualTo",
            Values: [month]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Error fetching budget by category:", error?.response?.data?.message || error);
      return null;
    }
  },

  async create(budgetData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            category_c: budgetData.category_c,
            monthly_limit_c: parseFloat(budgetData.monthly_limit_c),
            month_c: budgetData.month_c
          }
        ]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create budget:`, failed);
          throw new Error(failed[0].message || "Failed to create budget");
        }
        return response.results[0].data;
      }

      return null;
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, budgetData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id)
      };

      if (budgetData.category_c !== undefined) updateData.category_c = budgetData.category_c;
      if (budgetData.monthly_limit_c !== undefined) updateData.monthly_limit_c = parseFloat(budgetData.monthly_limit_c);
      if (budgetData.month_c !== undefined) updateData.month_c = budgetData.month_c;

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update budget:`, failed);
          throw new Error(failed[0].message || "Failed to update budget");
        }
        return response.results[0].data;
      }

      return null;
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async upsert(category, month, monthlyLimit) {
    try {
      const existing = await this.getByCategory(category, month);

      if (existing) {
        return await this.update(existing.Id, {
          category_c: category,
          monthly_limit_c: monthlyLimit,
          month_c: month
        });
      } else {
        return await this.create({
          category_c: category,
          monthly_limit_c: monthlyLimit,
          month_c: month
        });
      }
    } catch (error) {
      console.error("Error upserting budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete budget:`, failed);
          throw new Error(failed[0].message || "Failed to delete budget");
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      throw error;
    }
  }
};