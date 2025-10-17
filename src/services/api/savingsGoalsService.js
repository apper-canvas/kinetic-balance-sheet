import savingsGoalsData from "@/services/mockData/savingsGoals.json";

let savingsGoals = [...savingsGoalsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const savingsGoalsService = {
  async getAll() {
    await delay(250);
    return [...savingsGoals].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  },

  async getById(id) {
    await delay(200);
    const goal = savingsGoals.find(g => g.Id === parseInt(id));
    if (!goal) throw new Error("Savings goal not found");
    return { ...goal };
  },

  async create(goalData) {
    await delay(400);
    const maxId = Math.max(...savingsGoals.map(g => g.Id), 0);
    const newGoal = {
      ...goalData,
      Id: maxId + 1,
      currentAmount: 0,
      createdAt: new Date().toISOString()
    };
    savingsGoals.push(newGoal);
    return { ...newGoal };
  },

  async update(id, goalData) {
    await delay(400);
    const index = savingsGoals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) throw new Error("Savings goal not found");
    
    savingsGoals[index] = { ...savingsGoals[index], ...goalData };
    return { ...savingsGoals[index] };
  },

  async addContribution(id, amount) {
    await delay(350);
    const index = savingsGoals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) throw new Error("Savings goal not found");
    
    savingsGoals[index].currentAmount += parseFloat(amount);
    savingsGoals[index].updatedAt = new Date().toISOString();
    
    return { ...savingsGoals[index] };
  },

  async delete(id) {
    await delay(300);
    const index = savingsGoals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) throw new Error("Savings goal not found");
    
    savingsGoals.splice(index, 1);
    return true;
  }
};