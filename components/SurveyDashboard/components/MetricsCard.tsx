// components/SurveyDashboard/components/MetricsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: number;
  suffix?: string;
  description?: string;
}

export const MetricsCard = ({ title, value, suffix = '', description }: MetricsCardProps) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value.toFixed(1)}{suffix}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
    </CardContent>
  </Card>
);