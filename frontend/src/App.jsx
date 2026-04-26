import { useEffect, useMemo, useRef, useState } from "react";
import {
  getGreedyPortfolio,
  getOptimizedPortfolio,
  getStocks,
  getTopKStocks,
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
  const [stocks, setStocks] = useState([]);
  const [topStocks, setTopStocks] = useState([]);
  const [stockAnalysis, setStockAnalysis] = useState(null);

  const [topK, setTopK] = useState("3");
  const [budget, setBudget] = useState("");
  const [portfolioResult, setPortfolioResult] = useState(null);

  const [greedyResult, setGreedyResult] = useState([]);
  const [knapsackResult, setKnapsackResult] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [priceChangePercent, setPriceChangePercent] = useState(null);
  const previousPriceRef = useRef(null);

  useEffect(() => {
    loadStocks();
    loadTopStocks(3);
    loadStockAnalysis();

    const stockRefreshInterval = window.setInterval(() => {
      loadStockAnalysis();
    }, 3000);

    const timer = window.setTimeout(() => setIsLoaded(true), 120);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(stockRefreshInterval);
    };
  }, []);

  const loadStocks = async () => {
    try {
      const data = await getStocks();
      setStocks(Array.isArray(data) ? data : []);
    } catch {
      setStocks([]);
    }
  };

  const loadTopStocks = async (requestedK) => {
    const k = Math.max(1, Number(requestedK) || 3);
    try {
      const data = await getTopKStocks(k);
      setTopStocks(Array.isArray(data) ? data : []);
    } catch {
      setTopStocks([]);
    }
  };

  const loadStockAnalysis = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/stocks/AAPL");
      if (!response.ok) {
        setStockAnalysis(null);
        setPriceChangePercent(null);
        return;
      }
      const data = await response.json();
      const currentPrice = Number(data?.price);

      if (Number.isFinite(currentPrice) && currentPrice > 0) {
        if (previousPriceRef.current !== null && previousPriceRef.current > 0) {
          const change = ((currentPrice - previousPriceRef.current) / previousPriceRef.current) * 100;
          setPriceChangePercent(change);
        } else {
          setPriceChangePercent(null);
        }
        previousPriceRef.current = currentPrice;
      } else {
        setPriceChangePercent(null);
      }

      setStockAnalysis(data || null);
    } catch {
      setStockAnalysis(null);
      setPriceChangePercent(null);
    }
  };

  const handleTopKSearch = async () => {
    await loadTopStocks(topK);
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
  const safeAlerts = Array.isArray(stockAnalysis?.alerts) ? stockAnalysis.alerts : [];

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
          <GlassPanel className="stocks-panel reveal reveal-2">
            <SectionHeading eyebrow="Today's Stocks" title="Today's Stocks" />
            <div
              className="h-72 overflow-y-auto pr-2"
              style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
            >
              {stocks.map((stock) => (
                <StockCard key={`${stock?.symbol}-${stock?.price}`} stock={stock} />
              ))}
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
              <LiveChart currentPrice={Number(stockAnalysis?.price ?? 120)} />
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
            <div className="result-list" style={{ marginTop: 16 }}>
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
