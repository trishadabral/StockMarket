import { useState } from 'react';

export default function StockSelector({ onStartMonitoring, monitoredStocks }) {
    const [formData, setFormData] = useState({
        symbol: '',
        buyPrice: '',
        targetProfit: '',
        stopLoss: '',
        riskLevel: 'MEDIUM'
    });

    const [errors, setErrors] = useState({});

    const popularStocks = [
        { symbol: 'RELIANCE.NSE', name: 'Reliance Industries' },
        { symbol: 'TCS.NSE', name: 'Tata Consultancy Services' },
        { symbol: 'INFY.NSE', name: 'Infosys' },
        { symbol: 'HDFCBANK.NSE', name: 'HDFC Bank' },
        { symbol: 'ICICIBANK.NSE', name: 'ICICI Bank' },
        { symbol: 'WIPRO.NSE', name: 'Wipro' },
        { symbol: 'SBIN.NSE', name: 'State Bank of India' },
        { symbol: 'ITC.NSE', name: 'ITC Limited' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.symbol) {
            newErrors.symbol = 'Please select a stock symbol';
        }

        if (!formData.buyPrice || parseFloat(formData.buyPrice) <= 0) {
            newErrors.buyPrice = 'Buy price must be greater than 0';
        }

        if (!formData.targetProfit || parseFloat(formData.targetProfit) <= 0) {
            newErrors.targetProfit = 'Target profit must be greater than 0';
        }

        if (!formData.stopLoss || parseFloat(formData.stopLoss) <= 0) {
            newErrors.stopLoss = 'Stop loss must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const monitorRequest = {
            symbol: formData.symbol,
            buyPrice: parseFloat(formData.buyPrice),
            targetProfit: parseFloat(formData.targetProfit),
            stopLoss: parseFloat(formData.stopLoss),
            riskLevel: formData.riskLevel
        };

        onStartMonitoring(monitorRequest);

        // Reset form
        setFormData({
            symbol: '',
            buyPrice: '',
            targetProfit: '',
            stopLoss: '',
            riskLevel: 'MEDIUM'
        });
    };

    const isMonitored = (symbol) => {
        return Object.keys(monitoredStocks).includes(symbol);
    };

    return (
        <div className="card-gradient">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Start Monitoring
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Stock Symbol Selection */}
                <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                        Stock Symbol
                    </label>
                    <select
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleChange}
                        className="input-field w-full"
                    >
                        <option value="">Select a stock...</option>
                        {popularStocks.map(stock => (
                            <option
                                key={stock.symbol}
                                value={stock.symbol}
                                disabled={isMonitored(stock.symbol)}
                            >
                                {stock.symbol} - {stock.name} {isMonitored(stock.symbol) ? '✓' : ''}
                            </option>
                        ))}
                    </select>
                    {errors.symbol && (
                        <p className="text-red-400 text-xs mt-1">{errors.symbol}</p>
                    )}
                </div>

                {/* Buy Price */}
                <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                        Buy Price (₹)
                    </label>
                    <input
                        type="number"
                        name="buyPrice"
                        value={formData.buyPrice}
                        onChange={handleChange}
                        placeholder="e.g., 2500.00"
                        step="0.01"
                        className="input-field w-full"
                    />
                    {errors.buyPrice && (
                        <p className="text-red-400 text-xs mt-1">{errors.buyPrice}</p>
                    )}
                </div>

                {/* Target Profit & Stop Loss */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-300">
                            Target Profit (₹)
                        </label>
                        <input
                            type="number"
                            name="targetProfit"
                            value={formData.targetProfit}
                            onChange={handleChange}
                            placeholder="e.g., 50"
                            step="0.01"
                            className="input-field w-full"
                        />
                        {errors.targetProfit && (
                            <p className="text-red-400 text-xs mt-1">{errors.targetProfit}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-300">
                            Stop Loss (₹)
                        </label>
                        <input
                            type="number"
                            name="stopLoss"
                            value={formData.stopLoss}
                            onChange={handleChange}
                            placeholder="e.g., 30"
                            step="0.01"
                            className="input-field w-full"
                        />
                        {errors.stopLoss && (
                            <p className="text-red-400 text-xs mt-1">{errors.stopLoss}</p>
                        )}
                    </div>
                </div>

                {/* Risk Level */}
                <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                        Risk Level
                    </label>
                    <div className="flex gap-3">
                        {['LOW', 'MEDIUM', 'HIGH'].map(level => (
                            <label key={level} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="riskLevel"
                                    value={level}
                                    checked={formData.riskLevel === level}
                                    onChange={handleChange}
                                    className="mr-2 w-4 h-4 text-blue-600"
                                />
                                <span className={`text-sm font-medium ${formData.riskLevel === level ? 'text-blue-400' : 'text-slate-400'
                                    }`}>
                                    {level}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn-primary w-full"
                >
                    Start Monitoring 🚀
                </button>
            </form>

            {/* Monitored Stocks Summary */}
            {Object.keys(monitoredStocks).length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">
                        Currently Monitoring ({Object.keys(monitoredStocks).length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(monitoredStocks).map(symbol => (
                            <span key={symbol} className="badge-info">
                                {symbol}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
