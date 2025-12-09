import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

const BANKS = [
  "Banco do Brasil",
  "Caixa",
  "Sicoob",
  "Bradesco",
  "Carrefour",
  "Atacadão",
  "PicPay",
  "Nubank",
  "Santander",
  "Porto Seguro",
  "Safra",
  "Itaú",
];

export default function BanksSection() {
  const listCards = trpc.admin.listCards.useQuery(
    { search: "", limit: 1000, offset: 0 },
    { enabled: true }
  );

  if (listCards.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const cards = listCards.data?.cards || [];

  // Agrupar cartões por banco
  const cardsByBank = BANKS.map(bank => ({
    bank,
    count: cards.filter((card: any) => card.bank === bank).length,
    cards: cards.filter((card: any) => card.bank === bank),
  }));

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Cartões por Banco</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cardsByBank.map((item) => (
          <Card key={item.bank} className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">{item.bank}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-cyan-400">{item.count}</div>
              <p className="text-xs text-slate-400 mt-2">Cartão(ões) cadastrado(s)</p>
              
              {item.cards.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <p className="text-xs font-semibold text-slate-300 mb-2">Cartões:</p>
                  <ul className="space-y-1">
                    {item.cards.map((card: any) => (
                      <li key={card.id} className="text-xs text-slate-400">
                        • {card.holderName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
