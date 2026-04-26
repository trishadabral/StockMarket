package com.example.backend.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockAnalysisService {

    public String predictTrend(List<Double> prices) {
        if (prices == null || prices.size() < 2) {
            return "SIDEWAYS";
        }

        int up = 0;
        int down = 0;

        for (int i = 1; i < prices.size(); i++) {
            if (prices.get(i) > prices.get(i - 1)) {
                up++;
            } else {
                down++;
            }
        }

        if (up > down) {
            return "UP";
        }
        if (down > up) {
            return "DOWN";
        }

        return "SIDEWAYS";
    }

    public double calculateVolatility(List<Double> prices) {
        if (prices == null || prices.isEmpty()) {
            return 0;
        }

        double mean = prices.stream().mapToDouble(Double::doubleValue).average().orElse(0);

        double variance = 0;
        for (double p : prices) {
            variance += Math.pow(p - mean, 2);
        }

        return Math.sqrt(variance / prices.size());
    }

    public String getSuggestion(String trend, double volatility) {
        if ("UP".equals(trend) && volatility < 3) {
            return "BUY (Stable)";
        }
        if ("UP".equals(trend) && volatility >= 3) {
            return "HOLD (Risky)";
        }
        if ("DOWN".equals(trend) && volatility > 4) {
            return "SELL (High Risk)";
        }

        return "WAIT";
    }
}
