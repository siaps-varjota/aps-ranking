import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Award } from "lucide-react";

interface RankingItem {
  Posicao: number;
  Municipio: string;
  Estado: string;
  IBGE: number;
  Desempenho: number;
  Detalhes: {
    Ótimo: number;
    Bom: number;
    Suficiente: number;
    Regular: number;
    Vínculo_eSF: number;
    Vínculo_eAP: number;
    Qualidade_eSF: number;
    Qualidade_eAP: number;
    Qualidade_eSB: number;
    Qualidade_eMulti: number;
  };
}

export default function Home() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [filteredRanking, setFilteredRanking] = useState<RankingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassification, setSelectedClassification] = useState("all");
  const [selectedItem, setSelectedItem] = useState<RankingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const response = await fetch("/ranking_data.json");
        const data = await response.json();
        setRanking(data);
        setFilteredRanking(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setIsLoading(false);
      }
    };

    loadRanking();
  }, []);

  useEffect(() => {
    let filtered = ranking;

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.Municipio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por classificação
    if (selectedClassification !== "all") {
      filtered = filtered.filter((item) => {
        const detalhes = item.Detalhes;
        const total =
          detalhes.Ótimo + detalhes.Bom + detalhes.Suficiente + detalhes.Regular;
        if (total === 0) return false;

        const percentualOtimo = (detalhes.Ótimo / total) * 100;
        const percentualBom = (detalhes.Bom / total) * 100;

        if (selectedClassification === "otimo") return percentualOtimo >= 50;
        if (selectedClassification === "bom") return percentualBom >= 50;
        if (selectedClassification === "suficiente")
          return item.Desempenho >= 50 && item.Desempenho < 75;
        if (selectedClassification === "regular") return item.Desempenho < 50;

        return true;
      });
    }

    setFilteredRanking(filtered);
  }, [searchTerm, selectedClassification, ranking]);

  const getClassificationColor = (desempenho: number) => {
    if (desempenho >= 90) return "bg-green-100 text-green-800";
    if (desempenho >= 75) return "bg-blue-100 text-blue-800";
    if (desempenho >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  const getClassificationLabel = (desempenho: number) => {
    if (desempenho >= 90) return "Ótimo";
    if (desempenho >= 75) return "Bom";
    if (desempenho >= 50) return "Suficiente";
    return "Regular";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Ranking de Cofinanciamento
            </h1>
          </div>
          <p className="text-gray-600">
            Classificação baseada no Desempenho - Vínculo e Acompanhamento
            Territorial e Qualidade
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Município
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Digite o nome do município..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Classificação
              </label>
              <Select value={selectedClassification} onValueChange={setSelectedClassification}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="otimo">Ótimo (≥90%)</SelectItem>
                  <SelectItem value="bom">Bom (75-89%)</SelectItem>
                  <SelectItem value="suficiente">Suficiente (50-74%)</SelectItem>
                  <SelectItem value="regular">Regular (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600">Ótimo</div>
            <div className="text-2xl font-bold text-green-600">
              {ranking.filter((r) => r.Desempenho >= 90).length}
            </div>
          </Card>
          <Card className="bg-white p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600">Bom</div>
            <div className="text-2xl font-bold text-blue-600">
              {ranking.filter((r) => r.Desempenho >= 75 && r.Desempenho < 90).length}
            </div>
          </Card>
          <Card className="bg-white p-6 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600">Suficiente</div>
            <div className="text-2xl font-bold text-yellow-600">
              {ranking.filter((r) => r.Desempenho >= 50 && r.Desempenho < 75).length}
            </div>
          </Card>
          <Card className="bg-white p-6 border-l-4 border-orange-500">
            <div className="text-sm text-gray-600">Regular</div>
            <div className="text-2xl font-bold text-orange-600">
              {ranking.filter((r) => r.Desempenho < 50).length}
            </div>
          </Card>
        </div>

        {/* Ranking Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Posição</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Município</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Desempenho
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Classificação
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRanking.length > 0 ? (
                  filteredRanking.map((item, index) => (
                    <tr
                      key={item.IBGE}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.Posicao <= 3 && (
                            <TrendingUp className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className="font-bold text-gray-900">
                            #{item.Posicao}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.Municipio}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.Estado}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="font-bold text-lg text-blue-600">
                          {item.Desempenho.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={getClassificationColor(item.Desempenho)}>
                          {getClassificationLabel(item.Desempenho)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nenhum resultado encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredRanking.length} de {ranking.length} municípios
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedItem?.Municipio}</DialogTitle>
            <DialogDescription>
              Estado: {selectedItem?.Estado} | Código IBGE: {selectedItem?.IBGE}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Desempenho Geral */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Índice de Desempenho</div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {selectedItem?.Desempenho.toFixed(1)}%
              </div>
              <div className="text-sm font-medium text-gray-700">
                Classificação:{" "}
                <Badge
                  className={
                    selectedItem
                      ? getClassificationColor(selectedItem.Desempenho)
                      : ""
                  }
                >
                  {selectedItem
                    ? getClassificationLabel(selectedItem.Desempenho)
                    : ""}
                </Badge>
              </div>
            </div>

            {/* Distribuição de Equipes por Classificação */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-lg">
                Distribuição de Equipes por Classificação
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Ótimo</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {selectedItem?.Detalhes.Ótimo || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Bom</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {selectedItem?.Detalhes.Bom || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Suficiente</span>
                  </div>
                  <span className="font-semibold text-yellow-600">
                    {selectedItem?.Detalhes.Suficiente || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Regular</span>
                  </div>
                  <span className="font-semibold text-orange-600">
                    {selectedItem?.Detalhes.Regular || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Indicadores por Tipo de Equipe */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-lg">
                Indicadores por Tipo de Equipe
              </h4>

              <Tabs defaultValue="vinculo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vinculo">
                    Vínculo e Acompanhamento
                  </TabsTrigger>
                  <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
                </TabsList>

                <TabsContent value="vinculo" className="space-y-3 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm text-gray-700">Equipes de Saúde da Família (eSF)</span>
                        <span className="font-semibold text-blue-600">
                          {selectedItem?.Detalhes.Vínculo_eSF || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm text-gray-700">Equipes de Atenção Primária (eAP)</span>
                        <span className="font-semibold text-blue-600">
                          {selectedItem?.Detalhes.Vínculo_eAP || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qualidade" className="space-y-3 mt-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm text-gray-700">Equipes de Saúde da Família (eSF)</span>
                        <span className="font-semibold text-purple-600">
                          {selectedItem?.Detalhes.Qualidade_eSF || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm text-gray-700">Equipes de Atenção Primária (eAP)</span>
                        <span className="font-semibold text-purple-600">
                          {selectedItem?.Detalhes.Qualidade_eAP || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm text-gray-700">Equipes de Saúde Bucal (eSB)</span>
                        <span className="font-semibold text-purple-600">
                          {selectedItem?.Detalhes.Qualidade_eSB || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm text-gray-700">Equipes Multiprofissionais (eMulti)</span>
                        <span className="font-semibold text-purple-600">
                          {selectedItem?.Detalhes.Qualidade_eMulti || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Total de Equipes */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">Total de Equipes Avaliadas</div>
              <div className="text-2xl font-bold text-gray-900">
                {(selectedItem?.Detalhes.Ótimo || 0) +
                  (selectedItem?.Detalhes.Bom || 0) +
                  (selectedItem?.Detalhes.Suficiente || 0) +
                  (selectedItem?.Detalhes.Regular || 0)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
