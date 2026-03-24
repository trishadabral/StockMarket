import { useEffect, useMemo, useState } from "react";
import {
  getGreedyPortfolio,
  getOptimizedPortfolio,
  getStocks,
  getTopKStocks,
} from "./services/api";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
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

function StockCard({ stock, tone = "default", featured = false }) {
  return (
    <article className={`stock-card stock-card-${tone} ${featured ? "featured" : ""}`}>
      <div className="stock-card-topline">
        <span className="stock-ticker">{stock.symbol}</span>
        <span className="stock-chip">{featured ? "Top pick" : "Listed"}</span>
      </div>
      <h3>{stock.name}</h3>
      <div className="stock-metrics">
        <div>
          <span>Market Price</span>
          <strong>{formatCurrency(stock.price)}</strong>
        </div>
        <div>
          <span>Expected Return</span>
          <strong>{stock.expectedReturn}</strong>
        </div>
      </div>
    </article>
  );
}

function ResultCard({ title, caption, result, tone }) {
  const total = useMemo(
    () => result.reduce((sum, stock) => sum + Number(stock.price || 0), 0),
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
          <p>Run the strategy to populate this portfolio.</p>
        </div>
      ) : (
        <div className="result-list">
          {result.map((stock) => (
            <div
              key={`${title}-${stock.symbol}-${stock.price}`}
              className="result-list-item"
            >
              <div>
                <strong>{stock.symbol}</strong>
                <span>{stock.name}</span>
              </div>
              <b>{formatCurrency(stock.price)}</b>
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
  const [budget, setBudget] = useState("");
  const [greedyResult, setGreedyResult] = useState([]);
  const [knapsackResult, setKnapsackResult] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadStocks();
    loadTopStocks();
    const timer = window.setTimeout(() => setIsLoaded(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const loadStocks = async () => {
    const data = await getStocks();
    setStocks(data);
  };

  const loadTopStocks = async () => {
    const data = await getTopKStocks(3);
    setTopStocks(data);
  };

  const handleGreedy = async () => {
    if (!budget) return;
    const data = await getGreedyPortfolio(budget);
    setGreedyResult(data);
  };

  const handleKnapsack = async () => {
    if (!budget) return;
    const data = await getOptimizedPortfolio(budget);
    setKnapsackResult(data);
  };

  const totalStocks = stocks.length;
  const averagePrice = totalStocks
    ? stocks.reduce((sum, stock) => sum + Number(stock.price || 0), 0) / totalStocks
    : 0;
  const mostExpensive = stocks.reduce(
    (highest, current) =>
      Number(current.price || 0) > Number(highest.price || 0) ? current : highest,
    stocks[0] || {}
  );

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-lines" />

      <main className={`dashboard ${isLoaded ? "dashboard-visible" : ""}`}>
        <GlassPanel className="hero-panel reveal reveal-1">
          <div className="hero-copy">
            <p className="section-eyebrow">Portfolio intelligence</p>
            <h1>
              Modern stock analysis with a
              <span className="gradient-text"> colder, premium dashboard feel.</span>
            </h1>

            <div className="hero-pulse-row">
              <span className="hero-pulse-chip">Live market board</span>
              <span className="hero-pulse-chip">Glass optimizer</span>
              <span className="hero-pulse-chip">Realtime portfolio feel</span>
            </div>

            <div className="hero-actions">
              <button className="primary-button" onClick={handleKnapsack}>
                Optimize portfolio
              </button>
              <button className="ghost-button" onClick={loadTopStocks}>
                Refresh top picks
              </button>
            </div>
          </div>

          <div className="hero-metrics">
            <div className="metric-card">
              <span>Tracked stocks</span>
              <strong>{totalStocks || "--"}</strong>
            </div>
            <div className="metric-card">
              <span>Avg. market price</span>
              <strong>{totalStocks ? formatCurrency(averagePrice) : "--"}</strong>
            </div>
            <div className="metric-card metric-wide">
              <span>Highest priced listing</span>
              <strong>{mostExpensive.symbol || "Waiting for data"}</strong>
              <small>
                {mostExpensive.price ? formatCurrency(mostExpensive.price) : "No price yet"}
              </small>
            </div>
          </div>
        </GlassPanel>

        <section className="content-grid">
          <GlassPanel className="stocks-panel reveal reveal-2">
            <SectionHeading
              eyebrow="Market board"
              title="Available Stocks"
            />
            <div className="stock-grid">
              {stocks.map((stock) => (
                <StockCard key={`${stock.symbol}-${stock.price}`} stock={stock} />
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="side-panel reveal reveal-3">
            <SectionHeading
              eyebrow="Heap ranking"
              title="Top 3 Stocks"
              description="Priority candidates surfaced from the current dataset."
            />
            <div className="top-stock-list">
              {topStocks.map((stock) => (
                <StockCard
                  key={`top-${stock.symbol}-${stock.price}`}
                  stock={stock}
                  tone="accent"
                  featured
                />
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="optimizer-panel reveal reveal-4">
          <SectionHeading
            eyebrow="Strategy engine"
            title="Portfolio Optimizer"
            description="Enter a budget and compare the faster greedy selection against the more exhaustive knapsack result."
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
              <button className="primary-button" onClick={handleGreedy}>
                Run greedy
              </button>
              <button className="secondary-button" onClick={handleKnapsack}>
                Run knapsack
              </button>
            </div>
          </div>

          <div className="results-grid">
            <ResultCard
              title="Greedy Result"
              caption="Speed-first allocation"
              result={greedyResult}
              tone="warm"
            />
            <ResultCard
              title="Knapsack Result"
              caption="Optimal allocation"
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
