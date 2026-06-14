import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
      </div>
    );
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light mode' },
    { value: 'dark', icon: Moon, label: 'Dark mode' },
    { value: 'system', icon: Monitor, label: 'System preference' },
  ];

  const currentTheme = theme || 'light';
  const currentIcon = themes.find(t => t.value === currentTheme) || themes[0];

  return (
    <div className="relative group">
      <button
        onClick={() => {
          const next = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light';
          setTheme(next);
        }}
        className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-all duration-200 hover:shadow-sm"
        title={`Current: ${currentTheme}. Click to switch`}
      >
        <currentIcon.icon className="w-4 h-4 text-foreground" />
      </button>

      {/* Dropdown on hover */}
      <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
              currentTheme === value
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {currentTheme === value && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
