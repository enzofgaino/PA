
export const getWeatherData = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,sunshine_duration&timezone=America/Sao_Paulo&forecast_days=7`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados meteorológicos');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na API de clima:', error);
    throw error;
  }
};

export const getSolarPotential = (weatherData) => {
  if (!weatherData || !weatherData.daily) {
    return null;
  }

  const today = weatherData.daily;
  const sunshineHours = today.sunshine_duration[0] / 3600; // Converter segundos para horas
  const cloudCover = weatherData.current.cloud_cover;
  
  // Calcular potencial solar baseado nas horas de sol e cobertura de nuvens
  const basePotential = 100; // 100% em condições ideais
  const cloudReduction = cloudCover * 0.8; // Redução baseada na cobertura de nuvens
  const sunshineBonus = Math.min(sunshineHours * 10, 50); // Bônus baseado nas horas de sol
  
  const solarPotential = Math.max(0, Math.min(100, basePotential - cloudReduction + sunshineBonus));
  
  return {
    potential: Math.round(solarPotential),
    sunshineHours: Math.round(sunshineHours * 10) / 10,
    cloudCover,
    estimatedProduction: Math.round((solarPotential / 100) * 15 * 10) / 10 // Estimativa para um sistema de 15kW
  };
};

export const getWeatherDescription = (weatherCode) => {
  const weatherCodes = {
    0: 'Céu limpo',
    1: 'Principalmente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Neblina',
    48: 'Neblina com geada',
    51: 'Garoa leve',
    53: 'Garoa moderada',
    55: 'Garoa intensa',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva intensa',
    71: 'Neve leve',
    73: 'Neve moderada',
    75: 'Neve intensa',
    77: 'Granizo',
    80: 'Pancadas de chuva leves',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva intensas',
    85: 'Pancadas de neve leves',
    86: 'Pancadas de neve intensas',
    95: 'Tempestade',
    96: 'Tempestade com granizo leve',
    99: 'Tempestade com granizo intenso'
  };
  
  return weatherCodes[weatherCode] || 'Condição desconhecida';
};
