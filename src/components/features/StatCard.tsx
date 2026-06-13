import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconBg?: string;
  gradient?: string;
  delay?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconBg = 'gradient-primary',
  gradient,
  delay = '',
}: StatCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up ${delay} ${gradient ? `${gradient} text-white border-0` : ''}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className={`text-sm font-medium mb-1 ${gradient ? 'text-white/70' : 'text-muted-foreground'}`}>{title}</p>
          <p className={`text-2xl font-heading font-bold ${gradient ? 'text-white' : 'text-foreground'}`}>{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              gradient ? 'text-white/80' :
              changeType === 'up' ? 'text-green-600' :
              changeType === 'down' ? 'text-red-500' :
              'text-muted-foreground'
            }`}>
              {changeType === 'up' && <TrendingUp className="w-3 h-3" />}
              {changeType === 'down' && <TrendingDown className="w-3 h-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${gradient ? 'bg-white/20' : iconBg}`}>
          <Icon className={`w-5 h-5 ${gradient ? 'text-white' : 'text-white'}`} />
        </div>
      </div>
    </div>
  );
}
