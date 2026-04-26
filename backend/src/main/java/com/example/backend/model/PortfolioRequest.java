package com.example.backend.model;

public class PortfolioRequest {
    private double budget;
    private int topK;

    public PortfolioRequest() {
    }

    public PortfolioRequest(double budget, int topK) {
        this.budget = budget;
        this.topK = topK;
    }

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    public int getTopK() {
        return topK;
    }

    public void setTopK(int topK) {
        this.topK = topK;
    }
}
