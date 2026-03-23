package com.example.backend.controller;

import com.example.backend.algorithms.HeapRankingAlgorithm;
import com.example.backend.algorithms.GreedyAllocationAlgorithm;
import com.example.backend.algorithms.KnapsackAlgorithm;
import com.example.backend.model.Stock;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class StockController {

    private final HeapRankingAlgorithm heapRankingAlgorithm = new HeapRankingAlgorithm();

    private List<Stock> getSampleStocks() {
        return List.of(
                new Stock("AAPL", "Apple", 180, 12),
                new Stock("GOOGL", "Google", 140, 10),
                new Stock("TSLA", "Tesla", 250, 15),
                new Stock("AMZN", "Amazon", 130, 9),
                new Stock("MSFT", "Microsoft", 300, 11)
        );
    }

    @GetMapping("/api/stocks")
    public List<Stock> getStocks() {
        return getSampleStocks();
    }

    @GetMapping("/api/stocks/topk")
    public List<Stock> getTopKStocks(@RequestParam(defaultValue = "3") int k) {
        return heapRankingAlgorithm.getTopKStocks(getSampleStocks(), k);
    }
    @GetMapping("/api/portfolio/greedy")
    public List<Stock> getGreedyPortfolio(@RequestParam double budget) {
        GreedyAllocationAlgorithm greedy = new GreedyAllocationAlgorithm();
        return greedy.allocate(getSampleStocks(), budget);
    }
    @GetMapping("/api/portfolio/optimize")
    public List<Stock> getOptimizedPortfolio(@RequestParam int budget) {
        KnapsackAlgorithm knapsack = new KnapsackAlgorithm();
        return knapsack.optimizePortfolio(getSampleStocks(), budget);
    }
}