import { getApperClient } from "@/services/apperClient";

const TABLE_NAME = "category_c";

export const categoriesService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(TABLE_NAME, {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "is_default_c" } }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
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
          { field: { Name: "color_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "is_default_c" } }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error("Category not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
      throw new Error("Category not found");
    }
  },

  async getByType(type) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(TABLE_NAME, {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "is_default_c" } }
        ],
        where: [
          {
            FieldName: "type_c",
            Operator: "EqualTo",
            Values: [type]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching categories by type:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(categoryData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            name_c: categoryData.name_c,
            color_c: categoryData.color_c,
            type_c: categoryData.type_c,
            is_default_c: categoryData.is_default_c || false
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
          console.error(`Failed to create category:`, failed);
          throw new Error(failed[0].message || "Failed to create category");
        }
        return response.results[0].data;
      }

      return null;
    } catch (error) {
      console.error("Error creating category:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, categoryData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id)
      };

      if (categoryData.name_c !== undefined) updateData.name_c = categoryData.name_c;
      if (categoryData.color_c !== undefined) updateData.color_c = categoryData.color_c;
      if (categoryData.type_c !== undefined) updateData.type_c = categoryData.type_c;
      if (categoryData.is_default_c !== undefined) updateData.is_default_c = categoryData.is_default_c;

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
          console.error(`Failed to update category:`, failed);
          throw new Error(failed[0].message || "Failed to update category");
        }
        return response.results[0].data;
      }

      return null;
    } catch (error) {
      console.error("Error updating category:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete category:`, failed);
          throw new Error(failed[0].message || "Failed to delete category");
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting category:", error?.response?.data?.message || error);
      throw error;
    }
  }
};