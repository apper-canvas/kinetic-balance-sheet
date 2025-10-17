import { getApperClient } from "@/services/apperClient";

const TABLE_NAME = "savings_goal_c";
export const savingsGoalsService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(TABLE_NAME, {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } }
        ],
        orderBy: [
          {
            fieldName: "deadline_c",
            sorttype: "ASC"
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching savings goals:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error("Savings goal not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching savings goal ${id}:`, error?.response?.data?.message || error);
      throw new Error("Savings goal not found");
    }
  },

  async create(goalData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            name_c: goalData.name_c,
            target_amount_c: parseFloat(goalData.target_amount_c),
            current_amount_c: parseFloat(goalData.current_amount_c || 0),
            deadline_c: goalData.deadline_c
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
          console.error(`Failed to create savings goal:`, failed);
          throw new Error(failed[0].message || "Failed to create savings goal");
        }
        return response.results[0].data;
      }

      return null;
    } catch (error) {
      console.error("Error creating savings goal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, goalData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id)
      };

      if (goalData.name_c !== undefined) updateData.name_c = goalData.name_c;
      if (goalData.target_amount_c !== undefined) updateData.target_amount_c = parseFloat(goalData.target_amount_c);
      if (goalData.current_amount_c !== undefined) updateData.current_amount_c = parseFloat(goalData.current_amount_c);
      if (goalData.deadline_c !== undefined) updateData.deadline_c = goalData.deadline_c;

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
          console.error(`Failed to update savings goal:`, failed);
          throw new Error(failed[0].message || "Failed to update savings goal");
        }
        return response.results[0].data;
      }

      return null;
    } catch (error) {
      console.error("Error updating savings goal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async addContribution(id, amount) {
    try {
      const goal = await this.getById(id);
      if (!goal) throw new Error("Savings goal not found");

      const newAmount = (goal.current_amount_c || 0) + parseFloat(amount);
      
      return await this.update(id, {
        current_amount_c: newAmount
      });
    } catch (error) {
      console.error("Error adding contribution:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete savings goal:`, failed);
          throw new Error(failed[0].message || "Failed to delete savings goal");
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting savings goal:", error?.response?.data?.message || error);
throw error;
    }
  }
};