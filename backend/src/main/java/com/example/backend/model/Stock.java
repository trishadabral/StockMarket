package com.example.backend.model;

public class Stock {
    private String symbol;
    private String name;
    private double price;
    private double expectedReturn;

    public Stock(String symbol, String name, double price, double expectedReturn) {
        this.symbol = symbol;
        this.name = name;
        this.price = price;
        this.expectedReturn = expectedReturn;
    }

    public String getSymbol() { return symbol; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public double getExpectedReturn() { return expectedReturn; }
}