package com.example.backend.service;

import com.example.backend.algorithms.GreedyAllocationAlgorithm;
import com.example.backend.algorithms.HeapRankingAlgorithm;
import com.example.backend.algorithms.KnapsackAlgorithm;
import com.example.backend.model.Stock;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioService {

    private final GreedyAllocationAlgorithm greedyAllocationAlgorithm;
    private final HeapRankingAlgorithm heapRankingAlgorithm;
    private final KnapsackAlgorithm knapsackAlgorithm;

    public PortfolioService(
            GreedyAllocationAlgorithm greedyAllocationAlgorithm,
            HeapRankingAlgorithm heapRankingAlgorithm,
            KnapsackAlgorithm knapsackAlgorithm
    ) {
        this.greedyAllocationAlgorithm = greedyAllocationAlgorithm;
        this.heapRankingAlgorithm = heapRankingAlgorithm;
        this.knapsackAlgorithm = knapsackAlgorithm;
    }

    public Map<String, Object> optimizePortfolio(double budget, int topK) {
        List<Stock> stockUniverse = getAvailableStocks();

        int safeTopK = Math.max(1, Math.min(topK, stockUniverse.size()));
        int safeBudget = (int) Math.max(0, Math.floor(budget));

        List<Stock> topStocks = getTopKStocks(safeTopK);
        List<Stock> selectedStocks = knapsackAlgorithm.optimizePortfolio(topStocks, safeBudget);

        double totalCost = selectedStocks.stream().mapToDouble(Stock::getPrice).sum();
        double totalReturn = selectedStocks.stream().mapToDouble(Stock::getExpectedReturn).sum();

        Map<String, Object> response = new HashMap<>();
        response.put("selectedStocks", selectedStocks);
        response.put("totalCost", totalCost);
        response.put("totalReturn", totalReturn);
        return response;
    }

    public List<Stock> getTopKStocks(int topK) {
        List<Stock> stockUniverse = getAvailableStocks();
        int safeTopK = Math.max(1, Math.min(topK, stockUniverse.size()));
        return heapRankingAlgorithm.getTopKStocks(stockUniverse, safeTopK);
    }

    public List<Stock> optimizePortfolio(int budget) {
        int safeBudget = Math.max(0, budget);
        return knapsackAlgorithm.optimizePortfolio(getAvailableStocks(), safeBudget);
    }

    public List<Stock> greedyPortfolio(double budget) {
        double safeBudget = Math.max(0, budget);
        return greedyAllocationAlgorithm.allocate(getAvailableStocks(), safeBudget);
    }

    public List<Stock> getAvailableStocks() {
        return List.of(
                new Stock("AAPL", "Apple", 190, 18),
                new Stock("GOOGL", "Google", 140, 14),
                new Stock("MSFT", "Microsoft", 420, 24),
                new Stock("TSLA", "Tesla", 225, 30),
                new Stock("AMZN", "Amazon", 175, 15),
                new Stock("NVDA", "NVIDIA", 870, 40)
        );
    }
}
