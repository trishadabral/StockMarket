import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Get all stocks
export async function getStocks() {
  const response = await api.get("/stocks");
  return response.data;
}

// Top K stocks (Heap)
export async function getTopKStocks(k = 3) {
  const response = await api.get("/stocks/topk", {
    params: { k },
  });
  return response.data;
}

// Greedy portfolio
export async function getGreedyPortfolio(budget) {
  const response = await api.get("/portfolio/greedy", {
    params: { budget },
  });
  return response.data;
}

// Knapsack portfolio (Optimal)
export async function getOptimizedPortfolio(budget) {
  const response = await api.get("/portfolio/optimize", {
    params: { budget },
  });
  return response.data;
}

// Portfolio optimization with budget + topK
export async function optimizePortfolioWithTopK(budget, topK) {
  const response = await api.post("/portfolio/optimize", {
    budget: Number(budget),
    topK: Number(topK),
  });
  return response.data;
}
