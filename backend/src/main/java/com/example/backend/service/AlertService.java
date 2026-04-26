package com.example.backend.service;

import com.example.backend.model.Alert;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AlertService {

    private final List<Alert> alerts = new ArrayList<>();

    public void addAlert(Alert alert) {
        if (alert == null) {
            return;
        }
        alerts.add(alert);
    }

    public void addAlert(String symbol, double upperLimit, double lowerLimit) {
        alerts.add(new Alert(symbol, upperLimit, lowerLimit));
    }

    public List<String> checkAlerts(String symbol, double currentPrice) {
        List<String> triggered = new ArrayList<>();

        for (Alert alert : alerts) {
            if (alert.getSymbol() == null || !alert.getSymbol().equalsIgnoreCase(symbol)) {
                continue;
            }

            if (currentPrice >= alert.getUpperLimit()) {
                triggered.add(symbol + " crossed upper limit");
            }

            if (currentPrice <= alert.getLowerLimit()) {
                triggered.add(symbol + " dropped below lower limit");
            }
        }

        return triggered;
    }
}
