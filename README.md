# Stock Decision Engine

A full-stack stock analysis dashboard that combines algorithmic decision-making with an interactive UI to simulate real-time market insights.

---

## Demo

🔗 Live Demo: *Add your deployed link here*  
🎥 Demo Video: *Add Loom / Drive link here*

---

## Screenshots

### Dashboard Overview

![Dashboard](./assets/dashboard.png)

### Top K Stocks

![Top K](./assets/topk.png)

### Portfolio Optimizer

![Portfolio](./assets/portfolio.png)

### Live Chart

![Chart](./assets/chart.png)

---

## Overview

This project demonstrates how core Data Structures and Algorithms can be applied to real-world financial decision-making.

It provides a structured dashboard where users can:

* Analyze stock trends
* Rank top-performing stocks
* Optimize investment portfolios
* View dynamic price movement

---

## Features

### Live Stock Insight

* Real-time-like price updates
* Trend detection (UP / DOWN / SIDEWAYS)
* Volatility analysis
* Actionable suggestion (BUY / SELL / HOLD)

---

### Top K Stock Selection

* User-defined K value
* Returns highest ranked stocks
* Optimized using efficient selection logic

---

### Portfolio Optimization

* Budget-based stock selection
* Maximizes expected return
* Uses Knapsack algorithm

---

### Dynamic Chart

* Continuously updating line chart
* Simulates live market behavior

---

### Alerts & Signals

* Threshold-based alerts
* Decision-focused outputs

---

## Tech Stack

**Frontend**

* React (Vite)
* Tailwind CSS
* Recharts

**Backend**

* Java
* Spring Boot

---

## Algorithms Used

* Heap / Sorting -> Top K selection
* Knapsack -> Portfolio optimization
* Sliding Window -> Volatility calculation
* Trend Analysis -> Price movement

---

## Project Structure

backend/

* controller/
* service/
* model/
* algorithms/

frontend/

* components/
* pages/

---

## API Endpoints

### GET /api/stocks/{symbol}

Returns:

* price
* trend
* volatility
* suggestion

---

### POST /api/portfolio/optimize

Input:
{
"budget": 500,
"topK": 10
}

Output:

* selected stocks
* total return

---

## Setup

### Backend

cd backend  
./gradlew bootRun

### Frontend

cd frontend  
npm install  
npm run dev

---

## Highlights

* Practical use of DSA in a real application
* Clean backend architecture
* Interactive UI with dynamic data
* Designed for clarity and usability

---

## Future Scope

* Real-time stock API integration
* Advanced prediction models
* User accounts & portfolio tracking
* Deployment

---

## Author

Trisha Dabral

---

## License

For educational use.
