import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = {};
    }

    /**
     * Connect to WebSocket server
     */
    connect(onConnect, onError) {
        // Create SockJS connection
        const socket = new SockJS('http://localhost:8080/ws');

        // Create STOMP client
        this.client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log('STOMP:', str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // Set up connection callbacks
        this.client.onConnect = () => {
            console.log('WebSocket connected');
            this.connected = true;
            if (onConnect) onConnect();
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            this.connected = false;
            if (onError) onError(frame);
        };

        this.client.onWebSocketClose = () => {
            console.log('WebSocket closed');
            this.connected = false;
        };

        // Activate connection
        this.client.activate();
    }

    /**
     * Subscribe to stock updates
     */
    subscribeToStock(symbol, callback) {
        if (!this.client || !this.connected) {
            console.warn('WebSocket not connected');
            return null;
        }

        const destination = `/topic/stocks/${symbol}`;
        const subscription = this.client.subscribe(destination, (message) => {
            const stockData = JSON.parse(message.body);
            callback(stockData);
        });

        this.subscriptions[`stock_${symbol}`] = subscription;
        return subscription;
    }

    /**
     * Subscribe to notifications
     */
    subscribeToNotifications(callback) {
        if (!this.client || !this.connected) {
            console.warn('WebSocket not connected');
            return null;
        }

        const destination = '/topic/notifications';
        const subscription = this.client.subscribe(destination, (message) => {
            const notification = JSON.parse(message.body);
            callback(notification);
        });

        this.subscriptions['notifications'] = subscription;
        return subscription;
    }

    /**
     * Unsubscribe from a topic
     */
    unsubscribe(key) {
        if (this.subscriptions[key]) {
            this.subscriptions[key].unsubscribe();
            delete this.subscriptions[key];
        }
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        if (this.client) {
            Object.keys(this.subscriptions).forEach(key => {
                this.unsubscribe(key);
            });
            this.client.deactivate();
            this.connected = false;
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected;
    }
}

// Export singleton instance
export default new WebSocketService();
