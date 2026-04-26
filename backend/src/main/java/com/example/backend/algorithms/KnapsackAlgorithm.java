package com.example.backend.algorithms;

import com.example.backend.model.Stock;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class KnapsackAlgorithm {

    public List<Stock> optimizePortfolio(List<Stock> stocks, int budget) {
        int n = stocks.size();
        int[][] dp = new int[n + 1][budget + 1];

        for (int i = 1; i <= n; i++) {
            int price = (int) stocks.get(i - 1).getPrice();
            int value = (int) stocks.get(i - 1).getExpectedReturn();

            for (int w = 0; w <= budget; w++) {
                if (price <= w) {
                    dp[i][w] = Math.max(value + dp[i - 1][w - price], dp[i - 1][w]);
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }

        List<Stock> selected = new ArrayList<>();
        int w = budget;

        for (int i = n; i > 0; i--) {
            if (dp[i][w] != dp[i - 1][w]) {
                Stock stock = stocks.get(i - 1);
                selected.add(stock);
                w -= (int) stock.getPrice();
            }
        }

        return selected;
    }
}
