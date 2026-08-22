import { Download } from 'lucide-react';

interface ExportButtonProps {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
}

export default function ExportButton({
  onClick,
  label = 'Export',
  disabled = false,
}: ExportButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    window.print();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}