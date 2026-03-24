# Stock Monitoring & Decision Engine

A full-stack real-time stock monitoring application with algorithmic analysis for Indian stock markets. Built with **Spring Boot** (backend) and **React + Vite + Tailwind CSS** (frontend).

## 🚀 Features

- **Real-Time Stock Monitoring**: Live price updates via WebSocket
- **Algorithmic Analysis**:
  - **Sliding Window**: Trend detection and volatility analysis
  - **Greedy Algorithm**: Profit/loss threshold alerts
  - **Dynamic Programming**: Optimal trading strategy calculation
- **Personalized Alerts**: Customizable profit targets and stop-loss levels
- **Interactive Dashboard**: Real-time charts with Chart.js
- **Mock Data Mode**: Development-friendly with realistic price simulations
- **Premium UI**: Modern, responsive design with Tailwind CSS

## 🏗️ Architecture

```
/stock_market
├─ backend/          # Spring Boot application
│  ├─ src/main/java/com/stockmonitor/
│  │  ├─ Application.java
│  │  ├─ controller/    # REST API endpoints
│  │  ├─ service/       # Business logic & algorithms
│  │  ├─ model/         # Data models
│  │  ├─ util/          # API fetcher & utilities
│  │  └─ config/        # WebSocket & CORS config
│  └─ pom.xml
└─ frontend/         # React + Vite application
   ├─ src/
   │  ├─ components/    # React components
   │  ├─ services/      # API & WebSocket services
   │  └─ App.jsx
   └─ package.json
```

## 📋 Prerequisites

- **Java**: JDK 17 or higher
- **Maven**: 3.6+ (for building backend)
- **Node.js**: 18+ (for frontend)
- **npm**: 9+ (included with Node.js)

## 🔧 Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## 🔐 Configuration

### Environment Variables

Create a `.env` file in the project root (optional):

```env
# API Configuration
TWELVE_DATA_API_KEY=your_api_key_here

# Mock Mode (true for development, false for live API)
USE_MOCK_DATA=true

# Fetch Interval (seconds)
FETCH_INTERVAL_SECONDS=30
```

### Mock vs Live Mode

**Mock Mode** (Default - Recommended for Development):
- Set `USE_MOCK_DATA=true` in `application.properties`
- Generates realistic price fluctuations
- No API calls, no rate limits
- Perfect for development and testing

**Live Mode** (Production):
- Set `USE_MOCK_DATA=false`
- Requires Twelve Data API key
- Free tier: 800 calls/day, 8 calls/min
- Get your API key: https://twelvedata.com/

## 📊 Algorithm Implementations

### 1. Sliding Window Algorithm
**Purpose**: Real-time trend detection and volatility analysis

```java
// Maintains last N prices in a deque
Deque<Double> priceWindow = new ArrayDeque<>();

// On each price update:
priceWindow.addLast(currentPrice);
if (priceWindow.size() > windowSize) {
    priceWindow.removeFirst();
}

// Compute statistics
min = Collections.min(priceWindow);
max = Collections.max(priceWindow);
volatility = max - min;
trend = calculateTrend(priceWindow); // RISING/FALLING/STABLE
```

**Key Features**:
- O(1) insertion and deletion
- Configurable window size (default: 20 prices)
- Real-time trend detection

### 2. Greedy Threshold Algorithm
**Purpose**: Immediate profit/loss alert generation

```java
// Check profit target
if (currentPrice >= buyPrice + targetProfit) {
    notifyUser("Target profit reached!");
}

// Check stop loss
if (currentPrice <= buyPrice - stopLoss) {
    notifyUser("Stop loss hit!");
}
```

**Key Features**:
- O(1) threshold checking
- Prevents duplicate alerts
- Customizable risk levels

### 3. Dynamic Programming - Max Profit
**Purpose**: Calculate optimal trading strategy from historical data

```java
// dp[i][k] = max profit using first i prices with k transactions
int[][] dp = new int[n+1][maxTransactions+1];

for (int t = 1; t <= maxTransactions; t++) {
    int maxDiff = -prices[0];
    for (int d = 1; d < n; d++) {
        dp[d][t] = Math.max(dp[d-1][t], prices[d] + maxDiff);
        maxDiff = Math.max(maxDiff, dp[d-1][t-1] - prices[d]);
    }
}
```

**Key Features**:
- O(n*k) time complexity
- Optimal profit calculation
- Support for multiple transactions

## 🌐 API Endpoints

### Stock Management

#### Get Stock Data
```http
GET /api/stocks?symbol={SYMBOL}
```
Returns current price, history, and window analysis.

#### Start Monitoring
```http
POST /api/monitor
Content-Type: application/json

{
  "symbol": "RELIANCE.NSE",
  "buyPrice": 2500.00,
  "targetProfit": 50.00,
  "stopLoss": 30.00,
  "riskLevel": "MEDIUM"
}
```

#### Stop Monitoring
```http
DELETE /api/monitor/{symbol}
```

#### Get Monitored Stocks
```http
GET /api/monitor
```

### Notifications

#### Get All Notifications
```http
GET /api/notifications
```

#### Clear Notifications
```http
DELETE /api/notifications
```

### Analysis

#### Get DP Analysis
```http
GET /api/analysis/{symbol}?transactions=5
```
Returns optimal profit calculation with specified number of transactions.

## 🎯 Usage Example

1. **Start Both Servers**:
   - Backend: `mvn spring-boot:run` (port 8080)
   - Frontend: `npm run dev` (port 5173)

2. **Open Dashboard**: Navigate to `http://localhost:5173`

3. **Select a Stock**: Choose from popular Indian stocks (e.g., RELIANCE.NSE)

4. **Set Thresholds**:
   - Buy Price: ₹2500
   - Target Profit: ₹50
   - Stop Loss: ₹30
   - Risk Level: MEDIUM

5. **Start Monitoring**: Click "Start Monitoring 🚀"

6. **Watch Real-Time Updates**:
   - Price chart updates every 30 seconds
   - Green line = Target profit
   - Red line = Stop loss
   - Trend indicators (RISING/FALLING/STABLE)

7. **Receive Alerts**: Notifications appear when thresholds are hit

## 🎨 UI Features

- **Dark Mode Design**: Premium dark theme with gradients
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Real-Time Charts**: Smooth animations with Chart.js
- **Color-Coded Alerts**:
  - 🟢 Green: Profit alerts
  - 🔴 Red: Loss alerts
  - 🔵 Blue: Info alerts
- **Live Connection Status**: WebSocket indicator
- **Browser Notifications**: Desktop alerts (if permitted)

## 🧪 Testing

### Backend Testing
```bash
cd backend
mvn test
```

### Frontend Testing
```bash
cd frontend
npm run build
```

### Manual Testing
1. Start backend in mock mode
2. Start frontend
3. Monitor a stock (e.g., RELIANCE.NSE)
4. Observe price fluctuations and alerts
5. Test threshold triggers by adjusting values

## 📝 Stock Symbols

Popular Indian stocks supported (mock mode):
- `RELIANCE.NSE` - Reliance Industries
- `TCS.NSE` - Tata Consultancy Services
- `INFY.NSE` - Infosys
- `HDFCBANK.NSE` - HDFC Bank
- `ICICIBANK.NSE` - ICICI Bank
- `WIPRO.NSE` - Wipro
- `SBIN.NSE` - State Bank of India
- `ITC.NSE` - ITC Limited

## 🔍 Troubleshooting

### Backend Issues

**Port 8080 already in use**:
```bash
# Change port in application.properties
server.port=8081
```

**WebSocket connection failed**:
- Ensure CORS is properly configured
- Check firewall settings
- Verify backend is running

### Frontend Issues

**Dependencies not installing**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**WebSocket not connecting**:
- Check backend is running on port 8080
- Verify proxy configuration in `vite.config.js`
- Check browser console for errors

## 🚀 Production Deployment

### Backend
```bash
mvn clean package
java -jar target/stock-monitoring-backend-1.0.0.jar
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

## 📚 Technology Stack

**Backend**:
- ☕ Java 17
- 🍃 Spring Boot 3.2.0
- 🔌 Spring WebSocket
- 📅 Spring Scheduler
- 📊 Jackson (JSON)

**Frontend**:
- ⚛️ React 18
- ⚡ Vite 5
- 🎨 Tailwind CSS 3
- 📈 Chart.js 4
- 🔌 STOMP WebSocket
- 📡 Axios

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Built by Trisha Dabral.

---

**Happy Trading! 📈💰**
