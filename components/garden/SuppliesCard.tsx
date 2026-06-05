import { Supply } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export function SuppliesCard({ supplies }: { supplies: Supply[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4 text-soil-500" />
          Supplies on Hand
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {supplies.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-2 text-sm">
              <span className="text-stone-700">{s.item}</span>
              <span className="text-stone-400 shrink-0 text-xs">
                {s.qty}{s.spec ? ` ${s.spec}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
