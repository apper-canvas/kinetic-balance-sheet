import budgetsData from "@/services/mockData/budgets.json";

let budgets = [...budgetsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const budgetsService = {
  async getAll() {
    await delay(250);
    return [...budgets];
  },

  async getById(id) {
    await delay(200);
    const budget = budgets.find(b => b.Id === parseInt(id));
    if (!budget) throw new Error("Budget not found");
    return { ...budget };
  },

  async getByMonth(month) {
    await delay(250);
    return budgets.filter(b => b.month === month);
  },

  async getByCategory(category, month) {
    await delay(200);
    const budget = budgets.find(b => b.category === category && b.month === month);
    return budget ? { ...budget } : null;
  },

  async create(budgetData) {
    await delay(350);
    const maxId = Math.max(...budgets.map(b => b.Id), 0);
    const newBudget = {
      ...budgetData,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    budgets.push(newBudget);
    return { ...newBudget };
  },

  async update(id, budgetData) {
    await delay(350);
    const index = budgets.findIndex(b => b.Id === parseInt(id));
    if (index === -1) throw new Error("Budget not found");
    
    budgets[index] = { ...budgets[index], ...budgetData };
    return { ...budgets[index] };
  },

  async upsert(category, month, monthlyLimit) {
    await delay(350);
    const existingIndex = budgets.findIndex(b => b.category === category && b.month === month);
    
    if (existingIndex !== -1) {
      budgets[existingIndex] = { 
        ...budgets[existingIndex], 
        monthlyLimit,
        updatedAt: new Date().toISOString()
      };
      return { ...budgets[existingIndex] };
    } else {
      const maxId = Math.max(...budgets.map(b => b.Id), 0);
      const newBudget = {
        Id: maxId + 1,
        category,
        month,
        monthlyLimit,
        createdAt: new Date().toISOString()
      };
      budgets.push(newBudget);
      return { ...newBudget };
    }
  },

  async delete(id) {
    await delay(300);
    const index = budgets.findIndex(b => b.Id === parseInt(id));
    if (index === -1) throw new Error("Budget not found");
    
    budgets.splice(index, 1);
    return true;
  }
};