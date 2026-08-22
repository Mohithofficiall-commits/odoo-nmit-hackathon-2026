import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Command,
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  Bell,
  X,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

interface CommandMenuProps {
  onNavigate?: (path: string) => void;
}

export default function CommandMenu({ onNavigate }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }

    setOpen(false);
    setQuery('');
  };

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        title: 'Dashboard',
        description: 'Go to your dashboard',
        icon: LayoutDashboard,
        action: () => navigate('/dashboard'),
        keywords: ['home', 'overview', 'main'],
      },
      {
        id: 'employees',
        title: 'Employees',
        description: 'View and manage employees',
        icon: Users,
        action: () => navigate('/employees'),
        keywords: ['staff', 'people', 'team'],
      },
      {
        id: 'leave',
        title: 'Leave Management',
        description: 'Manage leave requests and balances',
        icon: CalendarDays,
        action: () => navigate('/leave'),
        keywords: ['vacation', 'holiday', 'absence'],
      },
      {
        id: 'documents',
        title: 'Documents',
        description: 'View company documents',
        icon: FileText,
        action: () => navigate('/documents'),
        keywords: ['files', 'reports'],
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'View your notifications',
        icon: Bell,
        action: () => navigate('/notifications'),
        keywords: ['alerts', 'messages'],
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Manage application settings',
        icon: Settings,
        action: () => navigate('/settings'),
        keywords: ['preferences', 'configuration'],
      },
    ],
    []
  );

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return commands;
    }

    return commands.filter((command) => {
      const searchableText = [
        command.title,
        command.description,
        ...(command.keywords ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [commands, query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedIndex(0);

      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => window.clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handleNavigation = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();

        setSelectedIndex((current) =>
          filteredCommands.length === 0
            ? 0
            : (current + 1) % filteredCommands.length
        );
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();

        setSelectedIndex((current) =>
          filteredCommands.length === 0
            ? 0
            : (current - 1 + filteredCommands.length) %
              filteredCommands.length
        );
      }

      if (event.key === 'Enter') {
        event.preventDefault();

        const selectedCommand = filteredCommands[selectedIndex];

        if (selectedCommand) {
          selectedCommand.action();
        }
      }
    };

    window.addEventListener('keydown', handleNavigation);

    return () => {
      window.removeEventListener('keydown', handleNavigation);
    };
  }, [open, filteredCommands, selectedIndex]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false);
          setQuery('');
        }
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-700">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands..."
            className="h-14 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            aria-label="Search commands"
          />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQuery('');
            }}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close command menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => {
              const Icon = command.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={command.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={command.action}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {command.title}
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {command.description}
                    </p>
                  </div>

                  {isSelected && (
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-6 py-10 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />

              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No commands found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try searching for another command.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-400 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 dark:border-slate-700 dark:bg-slate-800">
                ↑
              </kbd>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 dark:border-slate-700 dark:bg-slate-800">
                ↓
              </kbd>
              Navigate
            </span>

            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 dark:border-slate-700 dark:bg-slate-800">
                ↵
              </kbd>
              Select
            </span>
          </div>

          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            K
          </span>
        </div>
      </div>
    </div>
  );
}