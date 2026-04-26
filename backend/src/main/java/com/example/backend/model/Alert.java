package com.example.backend.model;

public class Alert {
    private String symbol;
    private double upperLimit;
    private double lowerLimit;

    public Alert() {
    }

    public Alert(String symbol, double upperLimit, double lowerLimit) {
        this.symbol = symbol;
        this.upperLimit = upperLimit;
        this.lowerLimit = lowerLimit;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public double getUpperLimit() {
        return upperLimit;
    }

    public void setUpperLimit(double upperLimit) {
        this.upperLimit = upperLimit;
    }

    public double getLowerLimit() {
        return lowerLimit;
    }

    public void setLowerLimit(double lowerLimit) {
        this.lowerLimit = lowerLimit;
    }
}
