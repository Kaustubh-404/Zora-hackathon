import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { Bell, X, TrendingUp, Trophy, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'bet_confirmed' | 'market_resolved' | 'nft_minted' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { updates } = useRealtimeUpdates();
  
  useEffect(() => {
    // Convert real-time updates to notifications
    updates.forEach(update => {
      const notification = convertUpdateToNotification(update);
      if (notification) {
        addNotification(notification);
      }
    });
  }, [updates]);
  
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 20));
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
      });
    }
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  
  const convertUpdateToNotification = (update: any): Notification | null => {
    switch (update.type) {
      case 'bet_placed':
        return {
          id: `bet_${update.marketId}_${Date.now()}`,
          type: 'bet_confirmed',
          title: 'Bet Confirmed',
          message: `Your bet on "${update.data.question}" has been confirmed!`,
          timestamp: new Date(),
          read: false,
        };
      
      case 'market_resolved':
        return {
          id: `resolved_${update.marketId}_${Date.now()}`,
          type: 'market_resolved',
          title: 'Market Resolved',
          message: `"${update.data.question}" has been resolved!`,
          timestamp: new Date(),
          read: false,
          action: {
            label: 'Claim Rewards',
            onClick: () => {
              // Navigate to rewards page
              console.log('Navigate to rewards');
            },
          },
        };
      
      default:
        return null;
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bet_confirmed':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'market_resolved':
        return <AlertCircle className="w-5 h-5 text-green-600" />;
      case 'nft_minted':
        return <Trophy className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                        {notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.action!.onClick();
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}