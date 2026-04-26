package com.example.backend.controller;

import com.example.backend.model.PortfolioRequest;
import com.example.backend.model.Stock;
import com.example.backend.service.PortfolioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/greedy")
    public List<Stock> getGreedyPortfolio(@RequestParam double budget) {
        return portfolioService.greedyPortfolio(budget);
    }

    @GetMapping("/optimize")
    public List<Stock> getOptimizedPortfolio(@RequestParam int budget) {
        return portfolioService.optimizePortfolio(budget);
    }

    @PostMapping("/optimize")
    public Map<String, Object> optimizePortfolio(@RequestBody PortfolioRequest request) {
        return portfolioService.optimizePortfolio(request.getBudget(), request.getTopK());
    }
}
