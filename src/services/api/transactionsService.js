import transactionsData from "@/services/mockData/transactions.json";

let transactions = [...transactionsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const transactionsService = {
  async getAll() {
    await delay(300);
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getById(id) {
    await delay(200);
    const transaction = transactions.find(t => t.Id === parseInt(id));
    if (!transaction) throw new Error("Transaction not found");
    return { ...transaction };
  },

  async getByDateRange(startDate, endDate) {
    await delay(300);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getByMonth(month) {
    await delay(300);
    return transactions
      .filter(t => t.date.startsWith(month))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getByCategory(category) {
    await delay(300);
    return transactions
      .filter(t => t.category === category)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async create(transactionData) {
    await delay(400);
    const maxId = Math.max(...transactions.map(t => t.Id), 0);
    const newTransaction = {
      ...transactionData,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    return { ...newTransaction };
  },

  async update(id, transactionData) {
    await delay(400);
    const index = transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error("Transaction not found");
    
    transactions[index] = { ...transactions[index], ...transactionData };
    return { ...transactions[index] };
  },

  async delete(id) {
    await delay(300);
    const index = transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error("Transaction not found");
    
    transactions.splice(index, 1);
    return true;
  }
};