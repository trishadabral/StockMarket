import { useEffect, useRef } from 'react';

export default function NotificationPanel({ notifications, onClear }) {
    const panelRef = useRef(null);

    // Auto-scroll to newest notification
    useEffect(() => {
        if (panelRef.current) {
            panelRef.current.scrollTop = 0;
        }
    }, [notifications]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'PROFIT': return '🎯';
            case 'LOSS': return '⚠️';
            case 'INFO': return '📊';
            default: return 'ℹ️';
        }
    };

    const getNotificationClass = (type) => {
        switch (type) {
            case 'PROFIT': return 'badge-profit';
            case 'LOSS': return 'badge-loss';
            case 'INFO': return 'badge-info';
            default: return 'badge-info';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="card-gradient h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="text-3xl">🔔</span>
                    Notifications
                </h2>
                {notifications.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Notification Count */}
            <div className="mb-4">
                <span className="text-sm text-slate-400">
                    {notifications.length} {notifications.length === 1 ? 'alert' : 'alerts'}
                </span>
            </div>

            {/* Notifications List */}
            <div
                ref={panelRef}
                className="flex-1 overflow-y-auto space-y-3 pr-2"
                style={{ maxHeight: '500px' }}
            >
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <div className="text-5xl mb-4">🔕</div>
                        <p className="text-lg">No notifications yet</p>
                        <p className="text-sm mt-2">Alerts will appear here</p>
                    </div>
                ) : (
                    notifications.map((notification, index) => (
                        <div
                            key={index}
                            className="notification-card bg-slate-800/50 rounded-lg p-4 border-l-4"
                            style={{
                                borderLeftColor:
                                    notification.type === 'PROFIT' ? '#10b981' :
                                        notification.type === 'LOSS' ? '#ef4444' : '#3b82f6'
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={getNotificationClass(notification.type)}>
                                            {notification.type}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {notification.stockSymbol}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-200 mb-2 whitespace-pre-wrap">
                                        {notification.message}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>{formatTime(notification.timestamp)}</span>
                                        {notification.currentPrice && (
                                            <span className="font-semibold">
                                                ₹{notification.currentPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
