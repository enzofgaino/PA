
export const ACHIEVEMENTS = [
  {
    id: 'producer_100',
    name: 'Produtor',
    description: 'Produziu 100 kWh de energia solar',
    icon: '⚡',
    requirement: 100,
    type: 'energy_produced',
    reward: 'Adesivo Solar Básico'
  },
  {
    id: 'economist_100',
    name: 'Economista',
    description: 'Economizou R$ 100 em energia',
    icon: '💰',
    requirement: 100,
    type: 'money_saved',
    reward: 'Caneca Eco-Friendly'
  },
  {
    id: 'ecologist_5',
    name: 'Ecologista',
    description: 'Salvou 5 árvores com energia solar',
    icon: '🌳',
    requirement: 5,
    type: 'trees_saved',
    reward: 'Muda de Árvore'
  },
  {
    id: 'producer_500',
    name: 'Mestre',
    description: 'Produziu 500 kWh de energia solar',
    icon: '🔋',
    requirement: 500,
    type: 'energy_produced',
    reward: 'Kit de Limpeza Solar'
  },
  {
    id: 'economist_500',
    name: 'Campeão',
    description: 'Economizou R$ 500 em energia',
    icon: '🏆',
    requirement: 500,
    type: 'money_saved',
    reward: 'Camiseta Solar Premium'
  },
  {
    id: 'ecologist_20',
    name: 'Guardião',
    description: 'Salvou 20 árvores com energia solar',
    icon: '🌲',
    requirement: 20,
    type: 'trees_saved',
    reward: 'Kit de Jardinagem'
  }
];

export const checkAchievements = (userData) => {
  const unlockedAchievements = [];
  const userAchievements = userData.achievements || [];
  
  ACHIEVEMENTS.forEach(achievement => {
    // Verificar se já foi desbloqueada
    if (userAchievements.find(ua => ua.id === achievement.id)) {
      return;
    }
    
    let currentValue = 0;
    
    switch (achievement.type) {
      case 'energy_produced':
        currentValue = userData.energyData?.totalProduced || 0;
        break;
      case 'money_saved':
        currentValue = userData.energyData?.totalSaved || 0;
        break;
      case 'trees_saved':
        currentValue = Math.floor((userData.energyData?.totalProduced || 0) * 0.02);
        break;
    }
    
    if (currentValue >= achievement.requirement) {
      unlockedAchievements.push({
        ...achievement,
        unlockedAt: new Date().toISOString()
      });
    }
  });
  
  return unlockedAchievements;
};

export const getAchievementProgress = (userData) => {
  const userAchievements = userData.achievements || [];
  
  return ACHIEVEMENTS.map(achievement => {
    const isUnlocked = userAchievements.find(ua => ua.id === achievement.id);
    
    let currentValue = 0;
    
    switch (achievement.type) {
      case 'energy_produced':
        currentValue = userData.energyData?.totalProduced || 0;
        break;
      case 'money_saved':
        currentValue = userData.energyData?.totalSaved || 0;
        break;
      case 'trees_saved':
        currentValue = Math.floor((userData.energyData?.totalProduced || 0) * 0.02);
        break;
    }
    
    const progress = Math.min(100, (currentValue / achievement.requirement) * 100);
    
    return {
      ...achievement,
      isUnlocked: !!isUnlocked,
      currentValue,
      progress,
      unlockedAt: isUnlocked?.unlockedAt
    };
  });
};
