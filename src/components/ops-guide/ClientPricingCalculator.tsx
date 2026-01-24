import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, Calculator } from "lucide-react";

interface ServiceTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

const serviceTiers: ServiceTier[] = [
  {
    id: "basic",
    name: "Basic Hosting",
    price: 99,
    features: ["Supabase instance", "Basic monitoring", "Email support"],
  },
  {
    id: "standard",
    name: "Standard",
    price: 149,
    features: ["Everything in Basic", "Vercel deployment", "Weekly security scans", "Priority support"],
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 249,
    features: ["Everything in Standard", "Custom domain setup", "Daily backups", "24/7 support", "Performance optimization"],
  },
];

export const ClientPricingCalculator = () => {
  const [clientCounts, setClientCounts] = useState<Record<string, number>>({
    basic: 2,
    standard: 5,
    premium: 1,
  });

  const updateClientCount = (tierId: string, count: number) => {
    setClientCounts((prev) => ({ ...prev, [tierId]: count }));
  };

  const totalClients = Object.values(clientCounts).reduce((sum, count) => sum + count, 0);
  
  const monthlyRevenue = serviceTiers.reduce((sum, tier) => {
    return sum + (clientCounts[tier.id] || 0) * tier.price;
  }, 0);

  const yearlyRevenue = monthlyRevenue * 12;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Revenue Calculator
        </CardTitle>
        <CardDescription>
          Estimate your monthly recurring revenue based on client distribution across service tiers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenue Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold">{totalClients}</div>
              <div className="text-xs text-muted-foreground">Total Clients</div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="pt-4 text-center">
              <DollarSign className="h-6 w-6 text-success mx-auto mb-1" />
              <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Monthly MRR</div>
            </CardContent>
          </Card>
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="pt-4 text-center">
              <TrendingUp className="h-6 w-6 text-warning mx-auto mb-1" />
              <div className="text-2xl font-bold">${yearlyRevenue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Annual Revenue</div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Sliders */}
        <div className="space-y-6">
          {serviceTiers.map((tier) => (
            <div key={tier.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">{tier.name}</Label>
                  {tier.recommended && (
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold">${tier.price}</span>
                  <span className="text-muted-foreground text-sm">/mo per client</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Slider
                  value={[clientCounts[tier.id] || 0]}
                  onValueChange={(value) => updateClientCount(tier.id, value[0])}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <div className="w-20 text-right">
                  <span className="font-mono text-lg">{clientCounts[tier.id] || 0}</span>
                  <span className="text-muted-foreground text-sm"> clients</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {tier.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs font-normal">
                    {feature}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                Subtotal: <span className="font-medium text-foreground">
                  ${((clientCounts[tier.id] || 0) * tier.price).toLocaleString()}/mo
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Profit Margin Tip */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro tip:</strong> Your actual costs (Supabase Pro ~$25, Vercel Pro ~$20) 
            leave you with <span className="text-success font-medium">~70-80% profit margins</span> on each client.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
