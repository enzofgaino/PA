
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, Zap, Eye } from 'lucide-react';
import { getWeatherData, getSolarPotential, getWeatherDescription } from '@/utils/weatherApi';

function WeatherWidget({ latitude = -23.5505, longitude = -46.6333 }) {
  const [weatherData, setWeatherData] = useState(null);
  const [solarData, setSolarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherData();
  }, [latitude, longitude]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const data = await getWeatherData(latitude, longitude);
      setWeatherData(data);
      
      const solar = getSolarPotential(data);
      setSolarData(solar);
      
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados meteorológicos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherCode) => {
    if (weatherCode <= 1) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (weatherCode <= 3) return <Cloud className="w-8 h-8 text-gray-500" />;
    return <CloudRain className="w-8 h-8 text-blue-500" />;
  };

  const getSolarPotentialColor = (potential) => {
    if (potential >= 80) return 'text-green-600';
    if (potential >= 60) return 'text-yellow-600';
    if (potential >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Sun className="w-5 h-5 mr-2 text-yellow-600" />
            Condições Climáticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weatherData && (
            <div className="space-y-4">
              {/* Condições Atuais */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getWeatherIcon(weatherData.current.weather_code)}
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {Math.round(weatherData.current.temperature_2m)}°C
                    </div>
                    <div className="text-sm text-gray-600">
                      {getWeatherDescription(weatherData.current.weather_code)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600">
                    <Eye className="w-4 h-4 mr-1" />
                    {weatherData.current.relative_humidity_2m}% umidade
                  </div>
                  <div className="text-sm text-gray-600">
                    {weatherData.current.cloud_cover}% nuvens
                  </div>
                </div>
              </div>

              {/* Potencial Solar */}
              {solarData && (
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                      Potencial Solar Hoje
                    </h4>
                    <div className={`text-2xl font-bold ${getSolarPotentialColor(solarData.potential)}`}>
                      {solarData.potential}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Horas de Sol:</div>
                      <div className="font-semibold">{solarData.sunshineHours}h</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Produção Estimada:</div>
                      <div className="font-semibold text-green-600">{solarData.estimatedProduction} kWh</div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${solarData.potential}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-2 rounded-full ${
                          solarData.potential >= 80 ? 'bg-green-500' :
                          solarData.potential >= 60 ? 'bg-yellow-500' :
                          solarData.potential >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Previsão dos Próximos Dias */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Próximos 3 Dias</h4>
                <div className="grid grid-cols-3 gap-2">
                  {weatherData.daily.time.slice(1, 4).map((date, index) => (
                    <div key={date} className="text-center p-2 bg-white/40 rounded">
                      <div className="text-xs text-gray-600 mb-1">
                        {new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div className="flex justify-center mb-1">
                        {getWeatherIcon(weatherData.daily.weather_code[index + 1])}
                      </div>
                      <div className="text-xs font-semibold">
                        {Math.round(weatherData.daily.temperature_2m_max[index + 1])}°/
                        {Math.round(weatherData.daily.temperature_2m_min[index + 1])}°
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default WeatherWidget;
