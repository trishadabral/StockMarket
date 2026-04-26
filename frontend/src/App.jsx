import { useEffect, useMemo, useRef, useState } from "react";
import {
  getGreedyPortfolio,
  getOptimizedPortfolio,
  optimizePortfolioWithTopK,
} from "./services/api";
import LiveChart from "./components/LiveChart";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getVolatilityLevel(v) {
  if (v < 2) return "LOW";
  if (v < 5) return "MEDIUM";
  return "HIGH";
}

function getSignalClass(value) {
  const normalized = String(value || "").toUpperCase();
  if (normalized.startsWith("BUY") || normalized === "UP") return "signal-positive";
  if (normalized.startsWith("SELL") || normalized === "DOWN") return "signal-negative";
  return "signal-neutral";
}

function calculateStdDev(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

const generateStocks = () => {
  const symbols = [
    "AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA", "META", "NFLX",
    "BABA", "ORCL", "INTC", "AMD", "IBM", "UBER", "LYFT", "SHOP",
    "ADBE", "CRM", "PYPL", "SQ", "SONY", "TCS", "INFY", "HCL",
    "WIPRO", "SAP", "DELL", "HPQ", "CSCO", "QCOM", "TXN", "AVGO"
  ];

  return symbols.map((symbol) => {
    const price = 50 + Math.random() * 500;
    const history = Array.from({ length: 10 }, (_, idx) =>
      Number((price + (idx - 5) * ((Math.random() - 0.5) * 2)).toFixed(2))
    );
    const volatility = calculateStdDev(history);
    return {
      symbol,
      price: price.toFixed(2),
      change: 0,
      trend: "SIDEWAYS",
      volatility: Number(volatility.toFixed(2)),
      suggestion: "HOLD",
      expectedReturn: Number((3 + Math.random() * 8).toFixed(2)),
      history,
    };
  });
};

function GlassPanel({ className = "", children }) {
  return <section className={`glass-panel ${className}`}>{children}</section>;
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

function HeroCard({ data, changePercent }) {
  const symbol = data?.symbol || "AAPL";
  const price = Number(data?.price ?? 0);
  const trend = String(data?.trend || "SIDEWAYS");
  const suggestion = String(data?.suggestion || "HOLD");
  const volatilityValue = Number(data?.volatility ?? 0);
  const volatilityLabel = getVolatilityLevel(volatilityValue);
  const subtitle = `${
    trend === "UP" ? "Strong upward trend" : trend === "DOWN" ? "Downward pressure detected" : "Sideways movement"
  } with ${volatilityLabel.toLowerCase()} volatility`;

  return (
    <GlassPanel className="hero-panel reveal reveal-1">
      <div className="hero-copy">
        <p className="section-eyebrow">Single Stock Insight</p>
        <h1>
          Stock Decision
          <span className="gradient-text"> Engine</span>
        </h1>
        <p className="hero-description">{subtitle}</p>
      </div>
      <div className="hero-metrics">
        <div className="metric-card">
          <span>Current price</span>
          <strong>
            {formatCurrency(price)}{" "}
            {changePercent !== null ? (
              <span className={changePercent >= 0 ? "signal-positive" : "signal-negative"}>
                ({changePercent >= 0 ? "+" : ""}
                {changePercent.toFixed(2)}%)
              </span>
            ) : null}
          </strong>
          {changePercent === null ? (
            <small>
              Waiting for update
            </small>
          ) : null}
        </div>
        <div className="metric-card">
          <span>Trend</span>
          <strong className={getSignalClass(trend)}>{trend}</strong>
        </div>
        <div className="metric-card metric-wide">
          <span>Suggestion</span>
          <strong className={getSignalClass(suggestion)}>{suggestion}</strong>
          <small>
            Volatility: {volatilityLabel} ({volatilityValue.toFixed(2)})
          </small>
        </div>
      </div>
    </GlassPanel>
  );
}

function StockCard({ stock, tone = "default", featured = false }) {
  return (
    <article className={`stock-card stock-card-${tone} ${featured ? "featured" : ""}`}>
      <div className="stock-card-topline">
        <span className="stock-ticker">{stock?.symbol || "N/A"}</span>
        <span className="stock-chip">{featured ? "Top pick" : "Listed"}</span>
      </div>
      <h3>{stock?.name || stock?.symbol || "Unknown Stock"}</h3>
      <div className="stock-metrics">
        <div>
          <span>Market Price</span>
          <strong>{formatCurrency(stock?.price)}</strong>
        </div>
        <div>
          <span>Expected Return</span>
          <strong>{Number(stock?.expectedReturn ?? 0).toFixed(2)}</strong>
        </div>
      </div>
    </article>
  );
}

function ResultCard({ title, caption, result, tone }) {
  const total = useMemo(
    () => result.reduce((sum, stock) => sum + Number(stock?.price || 0), 0),
    [result]
  );

  return (
    <article className={`result-card result-card-${tone}`}>
      <div className="result-card-head">
        <div>
          <p>{caption}</p>
          <h3>{title}</h3>
        </div>
        <div className="result-total">
          <span>Total deployed</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>

      {result.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-dot" />
          <p>Run this strategy to view stock picks.</p>
        </div>
      ) : (
        <div className="result-list">
          {result.map((stock, idx) => (
            <div key={`${title}-${stock?.symbol}-${idx}`} className="result-list-item">
              <div>
                <strong>{stock?.symbol || "N/A"}</strong>
                <span>{stock?.name || "Stock"}</span>
              </div>
              <b>{formatCurrency(stock?.price)}</b>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function App() {
  const [stocks, setStocks] = useState(generateStocks());
  const [topStocks, setTopStocks] = useState([]);
  const [stockAnalysis, setStockAnalysis] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);

  const [topK, setTopK] = useState("3");
  const [budget, setBudget] = useState("");
  const [portfolioResult, setPortfolioResult] = useState(null);

  const [greedyResult, setGreedyResult] = useState([]);
  const [knapsackResult, setKnapsackResult] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [priceChangePercent, setPriceChangePercent] = useState(null);
  const previousPriceRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoaded(true), 120);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((stock) => {
          const delta = (Math.random() - 0.5) * 2;
          const currentPrice = Number(stock.price);
          const newPrice = Math.max(1, currentPrice + delta);
          const updatedHistory = [...(stock.history || []), Number(newPrice.toFixed(2))].slice(-10);
          const volatility = calculateStdDev(updatedHistory);
          const trend =
            delta > 0.5 ? "UP" :
            delta < -0.5 ? "DOWN" :
            "SIDEWAYS";
          const suggestion =
            trend === "UP" && volatility < 3
              ? "BUY"
              : trend === "DOWN"
              ? "SELL"
              : "HOLD";

          return {
            ...stock,
            price: newPrice.toFixed(2),
            change: Number(delta.toFixed(2)),
            trend,
            volatility: Number(volatility.toFixed(2)),
            suggestion,
            expectedReturn: Number(
              (
                (trend === "UP" ? 9 : trend === "DOWN" ? 2 : 5) +
                Math.max(0, 5 - volatility)
              ).toFixed(2)
            ),
            history: updatedHistory,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const k = Math.max(1, Number(topK) || 3);
    const sorted = [...stocks].sort((a, b) => b.expectedReturn - a.expectedReturn);
    setTopStocks(sorted.slice(0, k));

    const focus = stocks.find((stock) => stock.symbol === "AAPL") || stocks[0];
    if (!focus) return;

    if (previousPriceRef.current !== null && previousPriceRef.current > 0) {
      const change =
        ((Number(focus.price) - previousPriceRef.current) / previousPriceRef.current) * 100;
      setPriceChangePercent(change);
    } else {
      setPriceChangePercent(null);
    }
    previousPriceRef.current = Number(focus.price);

    setStockAnalysis({
      symbol: focus.symbol,
      price: Number(focus.price),
      trend: focus.trend,
      volatility: Number(focus.volatility),
      suggestion: focus.suggestion,
      alerts: [],
    });

    const nextAlerts = [];
    if (Number(focus.price) > 300) {
      nextAlerts.push(`${focus.symbol}: Price crossed threshold`);
    }
    if (Number(focus.volatility) > 5) {
      nextAlerts.push(`${focus.symbol}: High volatility detected`);
    }

    if (nextAlerts.length > 0) {
      setLiveAlerts((prev) => [...nextAlerts, ...prev].slice(0, 20));
    }
  }, [stocks, topK]);

  const handleTopKSearch = async () => {
    const k = Math.max(1, Number(topK) || 3);
    const sorted = [...stocks].sort((a, b) => b.expectedReturn - a.expectedReturn);
    setTopStocks(sorted.slice(0, k));
  };

  const handlePortfolioOptimize = async () => {
    if (!budget) return;
    try {
      const data = await optimizePortfolioWithTopK(budget, topK || 3);
      setPortfolioResult(data || null);
    } catch {
      setPortfolioResult(null);
    }
  };

  // Keep existing functionality
  const handleGreedy = async () => {
    if (!budget) return;
    try {
      const data = await getGreedyPortfolio(budget);
      setGreedyResult(Array.isArray(data) ? data : []);
    } catch {
      setGreedyResult([]);
    }
  };

  const handleKnapsack = async () => {
    if (!budget) return;
    try {
      const data = await getOptimizedPortfolio(budget);
      setKnapsackResult(Array.isArray(data) ? data : []);
    } catch {
      setKnapsackResult([]);
    }
  };

  const safeTrend = String(stockAnalysis?.trend || "WAIT");
  const safeSuggestion = String(stockAnalysis?.suggestion || "HOLD");
  const safeVolatility = Number(stockAnalysis?.volatility ?? 0);
  const safeVolatilityLabel = getVolatilityLevel(safeVolatility);
  const backendAlerts = Array.isArray(stockAnalysis?.alerts) ? stockAnalysis.alerts : [];
  const safeAlerts = [...liveAlerts, ...backendAlerts].slice(0, 20);
  const sortedStocks = [...stocks].sort((a, b) => b.change - a.change);
  const topGainers = sortedStocks.filter((s) => s.change > 0).slice(0, 15);
  const topLosers = sortedStocks.filter((s) => s.change < 0).slice(0, 15);

  const selectedStocks = Array.isArray(portfolioResult?.selectedStocks)
    ? portfolioResult.selectedStocks
    : [];
  const totalReturn = Number(portfolioResult?.totalReturn ?? 0);
  const totalCost = Number(portfolioResult?.totalCost ?? 0);

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-lines" />

      <main className={`dashboard ${isLoaded ? "dashboard-visible" : ""}`}>
        <HeroCard data={stockAnalysis} changePercent={priceChangePercent} />

        <section className="content-grid">
          <GlassPanel className="stocks-panel reveal reveal-2 self-start h-fit" style={{ alignSelf: "start" }}>
            <SectionHeading eyebrow="Today's Stocks" title="Today's Stocks" />
            <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
              <div>
                <h3 style={{ margin: "0 0 12px" }}>🔥 Top Gainers</h3>
                <div className="result-list">
                  {topGainers.map((stock) => (
                    <article key={`gainer-${stock.symbol}`} className="stock-card">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "12px" }}>
                        <strong>{stock.symbol}</strong>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, fontWeight: 700 }}>{formatCurrency(stock.price)}</p>
                          <p className="text-green-400" style={{ margin: 0 }}>
                            +{stock.change}%
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ margin: "0 0 12px" }}>🔻 Top Losers</h3>
                <div className="result-list">
                  {topLosers.map((stock) => (
                    <article key={`loser-${stock.symbol}`} className="stock-card">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "12px" }}>
                        <strong>{stock.symbol}</strong>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, fontWeight: 700 }}>{formatCurrency(stock.price)}</p>
                          <p className="text-red-400" style={{ margin: 0 }}>
                            {stock.change}%
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="side-panel reveal reveal-3">
            <SectionHeading eyebrow="Single Stock Insight" title="AAPL Snapshot" />
            <div className="stock-grid" style={{ gridTemplateColumns: "1fr" }}>
              <article className="stock-card">
                <h3>Trend</h3>
                <div className="stock-metrics">
                  <strong className={getSignalClass(safeTrend)}>{safeTrend}</strong>
                </div>
              </article>
              <article className="stock-card">
                <h3>Volatility</h3>
                <div className="stock-metrics">
                  <strong>
                    {safeVolatilityLabel} ({safeVolatility.toFixed(2)})
                  </strong>
                </div>
              </article>
              <article className="stock-card">
                <h3>Suggestion</h3>
                <div className="stock-metrics">
                  <strong className={getSignalClass(safeSuggestion)}>{safeSuggestion}</strong>
                </div>
              </article>
            </div>
            <div className="mt-4">
              <LiveChart
                currentPrice={Number(stockAnalysis?.price ?? 120)}
                series={stocks.find((stock) => stock.symbol === "AAPL")?.history || []}
              />
            </div>
          </GlassPanel>
        </section>

        <section className="content-grid">
          <GlassPanel className="stocks-panel reveal reveal-3">
            <SectionHeading
              eyebrow="Top K Stocks"
              title="Top K Stocks"
              action={
                <div className="toolbar-actions" style={{ marginTop: 0 }}>
                  <button className="secondary-button" onClick={handleTopKSearch}>
                    Get Top Stocks
                  </button>
                </div>
              }
            />
            <div className="optimizer-toolbar" style={{ marginBottom: 18 }}>
              <label className="budget-input-wrap">
                <span>Number of stocks (K)</span>
                <input
                  type="number"
                  min="1"
                  value={topK}
                  onChange={(event) => setTopK(event.target.value)}
                />
              </label>
            </div>
            <div className="h-72 overflow-y-auto pr-2" style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr" }}>
              {topStocks.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-dot" />
                  <p>No top-ranked stocks available.</p>
                </div>
              ) : (
                topStocks.map((stock) => (
                  <StockCard
                    key={`top-${stock?.symbol}-${stock?.price}`}
                    stock={stock}
                    tone="accent"
                    featured
                  />
                ))
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="side-panel reveal reveal-4">
            <SectionHeading eyebrow="Alerts & Suggestions" title="Alerts & Suggestions" />
            <article className="stock-card">
              <h3>Suggestion</h3>
              <div className="stock-metrics">
                <strong className={getSignalClass(safeSuggestion)}>{safeSuggestion}</strong>
              </div>
            </article>
            <div className="result-list overflow-y-auto pr-2" style={{ marginTop: 16, maxHeight: "240px" }}>
              {safeAlerts.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-dot" />
                  <p>No alerts set</p>
                </div>
              ) : (
                safeAlerts.map((alert, idx) => (
                  <div className="result-list-item" key={`alert-${idx}`}>
                    <div>
                      <strong>Alert</strong>
                      <span>{alert}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="optimizer-panel reveal reveal-4">
          <SectionHeading
            eyebrow="Portfolio Optimizer"
            title="Portfolio Optimizer"
            description="Set budget and optimize through /api/portfolio/optimize."
          />

          <div className="optimizer-toolbar">
            <label className="budget-input-wrap">
              <span>Investment budget</span>
              <input
                type="number"
                placeholder="Enter budget in INR"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              />
            </label>

            <div className="toolbar-actions">
              <button className="primary-button" onClick={handlePortfolioOptimize}>
                Optimize Portfolio
              </button>
              <button className="ghost-button" onClick={handleGreedy}>
                Run Greedy
              </button>
              <button className="secondary-button" onClick={handleKnapsack}>
                Run Legacy Knapsack
              </button>
            </div>
          </div>

          <div className="results-grid">
            <article className="result-card result-card-cool">
              <div className="result-card-head">
                <div>
                  <p>Optimized API Result</p>
                  <h3>Selected Stocks</h3>
                </div>
                <div className="result-total">
                  <span>Total cost</span>
                  <strong>{formatCurrency(totalCost)}</strong>
                </div>
              </div>
              {selectedStocks.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-dot" />
                  <p>Run optimize portfolio to view selections.</p>
                </div>
              ) : (
                <div className="result-list">
                  {selectedStocks.map((stock, idx) => (
                    <div className="result-list-item" key={`opt-${stock?.symbol}-${idx}`}>
                      <div>
                        <strong>{stock?.symbol || "N/A"}</strong>
                        <span>{stock?.name || "Stock"}</span>
                      </div>
                      <b>{formatCurrency(stock?.price)}</b>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 14 }}>
                <span className="section-eyebrow" style={{ letterSpacing: "0.12em" }}>
                  Total Return
                </span>
                <h3 className={totalReturn >= 0 ? "signal-positive" : "signal-negative"}>
                  {totalReturn.toFixed(2)}
                </h3>
              </div>
            </article>

            <ResultCard
              title="Greedy Result"
              caption="Existing quick strategy"
              result={greedyResult}
              tone="warm"
            />
            <ResultCard
              title="Legacy Knapsack"
              caption="Existing budget-based route"
              result={knapsackResult}
              tone="cool"
            />
          </div>
        </GlassPanel>
      </main>
    </div>
  );
}

export default App;
