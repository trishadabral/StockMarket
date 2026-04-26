package com.example.backend.algorithms;

import com.example.backend.model.Stock;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class HeapRankingAlgorithm {

    public List<Stock> getTopKStocks(List<Stock> stocks, int k) {
        return stocks.stream()
                .sorted(Comparator.comparingDouble(Stock::getExpectedReturn).reversed())
                .limit(k)
                .collect(Collectors.toList());
    }
}
