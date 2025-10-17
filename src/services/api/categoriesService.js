import categoriesData from "@/services/mockData/categories.json";

let categories = [...categoriesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const categoriesService = {
  async getAll() {
    await delay(200);
    return [...categories];
  },

  async getById(id) {
    await delay(200);
    const category = categories.find(cat => cat.Id === parseInt(id));
    if (!category) throw new Error("Category not found");
    return { ...category };
  },

  async getByType(type) {
    await delay(200);
    return categories.filter(cat => cat.type === type);
  },

  async create(categoryData) {
    await delay(300);
    const maxId = Math.max(...categories.map(cat => cat.Id), 0);
    const newCategory = {
      ...categoryData,
      Id: maxId + 1,
      isDefault: false,
      createdAt: new Date().toISOString()
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, categoryData) {
    await delay(300);
    const index = categories.findIndex(cat => cat.Id === parseInt(id));
    if (index === -1) throw new Error("Category not found");
    
    categories[index] = { ...categories[index], ...categoryData };
    return { ...categories[index] };
  },

  async delete(id) {
    await delay(300);
    const index = categories.findIndex(cat => cat.Id === parseInt(id));
    if (index === -1) throw new Error("Category not found");
    
    const category = categories[index];
    if (category.isDefault) throw new Error("Cannot delete default category");
    
    categories.splice(index, 1);
    return true;
  }
};