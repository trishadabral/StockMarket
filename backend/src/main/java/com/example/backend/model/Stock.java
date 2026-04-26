package com.example.backend.model;

public class Stock {
    private String symbol;
    private String name;
    private double price;
    private double expectedReturn;

    public Stock() {
    }

    public Stock(String symbol, double price, double expectedReturn) {
        this.symbol = symbol;
        this.price = price;
        this.expectedReturn = expectedReturn;
    }

    public Stock(String symbol, String name, double price, double expectedReturn) {
        this.symbol = symbol;
        this.name = name;
        this.price = price;
        this.expectedReturn = expectedReturn;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getExpectedReturn() {
        return expectedReturn;
    }

    public void setExpectedReturn(double expectedReturn) {
        this.expectedReturn = expectedReturn;
    }
}
