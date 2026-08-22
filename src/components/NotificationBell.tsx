import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  X,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

interface NotificationBellProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

const defaultNotifications: Notification[] = [
  {
    id: '1',
    title: 'New announcement',
    message: 'A new company announcement is available.',
    time: '5 min ago',
    read: false,
  },
  {
    id: '2',
    title: 'Leave request updated',
    message: 'Your leave request status has been updated.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    title: 'Payslip available',
    message: 'Your latest payslip is now available.',
    time: 'Yesterday',
    read: true,
  },
];

export default function NotificationBell({
  notifications: initialNotifications = defaultNotifications,
  onNotificationClick,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    onNotificationClick?.(notification);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        aria-label={`Notifications${
          unreadCount > 0 ? `, ${unreadCount} unread` : ''
        }`}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[9999] mt-2 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Notifications
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                unreadCount &gt; 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? 's' : ''
                    }`
                  : 'You're all caught up'&rbrace;
                
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group relative px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      !notification.read
                        ? 'bg-slate-50/70 dark:bg-slate-800/30'
                        : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleNotificationClick(notification)
                      }
                      className="w-full pr-6 text-left"
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            notification.read
                              ? 'bg-transparent'
                              : 'bg-blue-500'
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-[11px] text-slate-400">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="absolute right-3 top-3 hidden gap-1 group-hover:flex">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          aria-label="Mark as read"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeNotification(notification.id)
                        }
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400"
                        aria-label="Remove notification"
                        title="Remove notification"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Bell className="h-5 w-5 text-slate-400" />
                </div>

                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  New notifications will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-lg px-3 py-2 text-center text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}