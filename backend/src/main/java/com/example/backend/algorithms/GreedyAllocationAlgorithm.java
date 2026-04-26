package com.example.backend.algorithms;

import com.example.backend.model.Stock;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class GreedyAllocationAlgorithm {

    public List<Stock> allocate(List<Stock> stocks, double budget) {
        List<Stock> sorted = stocks.stream()
                .sorted(Comparator.comparingDouble(Stock::getExpectedReturn).reversed())
                .toList();

        List<Stock> selected = new ArrayList<>();
        double total = 0;

        for (Stock stock : sorted) {
            if (total + stock.getPrice() <= budget) {
                selected.add(stock);
                total += stock.getPrice();
            }
        }

        return selected;
    }
}
