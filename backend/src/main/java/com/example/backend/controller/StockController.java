package com.example.backend.controller;

import com.example.backend.model.Stock;
import com.example.backend.service.AlertService;
import com.example.backend.service.PortfolioService;
import com.example.backend.service.StockAnalysisService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockAnalysisService stockAnalysisService;
    private final AlertService alertService;
    private final PortfolioService portfolioService;

    public StockController(
            StockAnalysisService stockAnalysisService,
            AlertService alertService,
            PortfolioService portfolioService
    ) {
        this.stockAnalysisService = stockAnalysisService;
        this.alertService = alertService;
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public List<Stock> getStocks() {
        return portfolioService.getAvailableStocks();
    }

    @GetMapping("/topk")
    public List<Stock> getTopKStocks(@RequestParam(defaultValue = "3") int k) {
        return portfolioService.getTopKStocks(k);
    }

    @GetMapping("/{symbol}")
    public Map<String, Object> getStockData(@PathVariable String symbol) {
        List<Double> prices = getPriceHistory(symbol);

        String trend = stockAnalysisService.predictTrend(prices);
        double volatility = stockAnalysisService.calculateVolatility(prices);
        String suggestion = stockAnalysisService.getSuggestion(trend, volatility);
        double currentPrice = prices.get(prices.size() - 1);

        List<String> triggeredAlerts = alertService.checkAlerts(symbol, currentPrice);

        Map<String, Object> response = new HashMap<>();
        response.put("symbol", symbol.toUpperCase());
        response.put("price", currentPrice);
        response.put("trend", trend);
        response.put("volatility", volatility);
        response.put("suggestion", suggestion);
        response.put("alerts", triggeredAlerts);
        return response;
    }

    private List<Double> getPriceHistory(String symbol) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int points = random.nextInt(10, 16);

        double price = random.nextDouble(100, 200);
        List<Double> prices = new ArrayList<>(points);

        for (int i = 0; i < points; i++) {
            price += (random.nextDouble() - 0.5) * 5;
            price = Math.max(1, price);
            prices.add(round(price));
        }

        return prices;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
