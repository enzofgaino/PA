
import React from 'react';
import { motion } from 'framer-motion';

function EnergyChart({ data, title = "Consumo de Energia" }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.energyProduced || 0, d.energyConsumed || 0, d.energySaved || 0))
  );

  const getBarHeight = (value) => {
    return (value / maxValue) * 200; // 200px altura máxima
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <div className="relative h-64 bg-white rounded-lg p-4 border border-gray-200">
        {/* Legenda */}
        <div className="flex justify-center mb-4 space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
            <span>Energia Produzida (kWh)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
            <span>Energia Consumida (kWh)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
            <span>Energia Economizada (kWh)</span>
          </div>
        </div>

        {/* Gráfico */}
        <div className="flex items-end justify-between h-48 relative">
          {data.slice(-10).map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center space-y-1 flex-1"
            >
              {/* Barras */}
              <div className="flex items-end space-x-1 h-40">
                {/* Energia Produzida */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: getBarHeight(item.energyProduced || 0) }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="w-3 bg-yellow-400 rounded-t"
                  style={{ minHeight: '2px' }}
                  title={`Produzida: ${item.energyProduced || 0} kWh`}
                />
                
                {/* Energia Consumida */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: getBarHeight(item.energyConsumed || 0) }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="w-3 bg-red-400 rounded-t"
                  style={{ minHeight: '2px' }}
                  title={`Consumida: ${item.energyConsumed || 0} kWh`}
                />
                
                {/* Energia Economizada */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: getBarHeight(item.energySaved || 0) }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="w-3 bg-green-400 rounded-t"
                  style={{ minHeight: '2px' }}
                  title={`Economizada: ${item.energySaved || 0} kWh`}
                />
              </div>
              
              {/* Data */}
              <div className="text-xs text-gray-500 transform -rotate-45 origin-center">
                {new Date(item.date).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tooltip hover */}
        <div className="absolute top-2 right-2 text-xs text-gray-500">
          Últimos 10 registros
        </div>
      </div>
    </div>
  );
}

export default EnergyChart;
