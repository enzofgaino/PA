
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Home, Zap, DollarSign, Clock, AlertTriangle, Info } from 'lucide-react';

function SolarCalculator() {
  const [formData, setFormData] = useState({
    houseSize: '',
    monthlyConsumption: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.houseSize || !formData.monthlyConsumption) {
      return;
    }

    setLoading(true);

    // Simular cálculo
    setTimeout(() => {
      const houseSize = parseFloat(formData.houseSize);
      const monthlyConsumption = parseFloat(formData.monthlyConsumption);
      
      // Cálculos baseados em estimativas reais
      const panelPower = 0.4; // kW por painel
      const panelSize = 2; // m² por painel
      const sunHoursPerDay = 5; // horas de sol por dia (média Brasil)
      const panelCost = 3800; // R$ por painel
      const energyPrice = 0.75; // R$ por kWh
      
      // Calcular número de painéis necessários
      const dailyConsumption = monthlyConsumption / 30;
      const requiredPower = dailyConsumption / sunHoursPerDay;
      const numberOfPanels = Math.ceil(requiredPower / panelPower);
      
      // Verificar se cabe na casa
      const requiredArea = numberOfPanels * panelSize;
      const availableArea = houseSize * 0.7; // 70% da área do telhado utilizável
      
      const totalCost = numberOfPanels * panelCost;
      const monthlyProduction = numberOfPanels * panelPower * sunHoursPerDay * 30;
      const monthlySavings = monthlyProduction * energyPrice;
      const paybackTime = totalCost / (monthlySavings * 12); // anos
      
      setResults({
        numberOfPanels,
        requiredArea,
        availableArea,
        fitsOnRoof: requiredArea <= availableArea,
        totalCost,
        monthlyProduction,
        monthlySavings,
        paybackTime,
        annualSavings: monthlySavings * 12
      });
      
      setLoading(false);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Calculator className="w-8 h-8 mr-3 text-green-600" />
            Calculadora de Painéis Solares
          </h1>
          <p className="text-gray-600">Calcule o número de painéis solares necessários com base no tamanho da casa e consumo mensal.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <Calculator className="w-6 h-6 mr-2 text-green-600" />
                  Calculadora
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="houseSize" className="text-gray-700 font-medium flex items-center">
                      <Home className="w-4 h-4 mr-1" />
                      Tamanho da Casa (m²) <Info className="w-4 h-4 ml-1 text-blue-500" />
                    </Label>
                    <Input
                      id="houseSize"
                      name="houseSize"
                      type="number"
                      placeholder="Ex: 120"
                      value={formData.houseSize}
                      onChange={handleChange}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyConsumption" className="text-gray-700 font-medium flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      Consumo Mensal (kWh) <Info className="w-4 h-4 ml-1 text-blue-500" />
                    </Label>
                    <Input
                      id="monthlyConsumption"
                      name="monthlyConsumption"
                      type="number"
                      placeholder="Ex: 150.5"
                      value={formData.monthlyConsumption}
                      onChange={handleChange}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Calculando...
                      </div>
                    ) : (
                      'Calcular'
                    )}
                  </Button>
                </form>

                {results && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Resultados do Cálculo</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{results.numberOfPanels}</div>
                        <div className="text-sm text-gray-600">Painéis Necessários</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">R$ {results.totalCost.toLocaleString('pt-BR')}</div>
                        <div className="text-sm text-gray-600">Investimento Total</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-emerald-600">{results.monthlyProduction.toFixed(1)} kWh</div>
                        <div className="text-sm text-gray-600">Produção Mensal</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{results.paybackTime.toFixed(1)} anos</div>
                        <div className="text-sm text-gray-600">Tempo de Retorno</div>
                      </div>
                    </div>

                    {!results.fitsOnRoof && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          Atenção: O sistema requer {results.requiredArea.toFixed(1)}m² mas sua casa tem apenas {results.availableArea.toFixed(1)}m² disponíveis no telhado.
                        </AlertDescription>
                      </Alert>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6 bg-green-50/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Informações Importantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Cada painel solar tem potência média de 400W e ocupa 2m²</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Consideramos 5 horas de sol útil por dia (média brasileira)</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Preço médio por painel: R$ 3.800 (instalação incluída)</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>70% da área do telhado é considerada utilizável</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800">Como Funciona</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <p className="text-gray-600">
                    A calculadora de painéis solares ajuda a determinar quantos painéis são necessários para atender às necessidades energéticas de uma residência ou empresa.
                  </p>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Processo de Cálculo</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</div>
                        <div className="text-gray-700">Insira o tamanho da casa em metros quadrados</div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</div>
                        <div className="text-gray-700">Informe o consumo mensal de energia em kWh</div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</div>
                        <div className="text-gray-700">O sistema calculará o número de painéis necessários</div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</div>
                        <div className="text-gray-700">Será apresentado o custo total e o tempo de retorno do investimento</div>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Este é um cálculo estimativo. Para uma avaliação precisa, recomendamos uma visita técnica.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                      Análise Financeira
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Economia Mensal:</span>
                        <span className="font-semibold text-green-600">R$ {results.monthlySavings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Economia Anual:</span>
                        <span className="font-semibold text-green-600">R$ {results.annualSavings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Área Necessária:</span>
                        <span className="font-semibold text-blue-600">{results.requiredArea.toFixed(1)}m²</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Área Disponível:</span>
                        <span className="font-semibold text-blue-600">{results.availableArea.toFixed(1)}m²</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default SolarCalculator;
