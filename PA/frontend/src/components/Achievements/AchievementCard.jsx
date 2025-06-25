
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Lock } from 'lucide-react';

function AchievementCard({ achievement, onClaim }) {
  const { isUnlocked, progress, currentValue, requirement, name, description, icon, reward } = achievement;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`relative overflow-hidden ${
        isUnlocked 
          ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <CardContent className="p-4">
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            {isUnlocked ? (
              <Badge className="bg-green-500 text-white">
                Desbloqueada
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-400 text-white">
                <Lock className="w-3 h-3 mr-1" />
                Bloqueada
              </Badge>
            )}
          </div>

          {/* Ícone e Título */}
          <div className="flex items-start space-x-3 mb-3">
            <div className={`text-3xl ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                {name}
              </h3>
              <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                {description}
              </p>
            </div>
          </div>

          {/* Progresso */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className={isUnlocked ? 'text-gray-700' : 'text-gray-500'}>
                Progresso
              </span>
              <span className={`font-semibold ${isUnlocked ? 'text-green-600' : 'text-gray-500'}`}>
                {currentValue} / {requirement}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-2 rounded-full ${
                  isUnlocked ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(progress)}% completo
            </div>
          </div>

          {/* Recompensa */}
          <div className={`p-3 rounded-lg ${
            isUnlocked ? 'bg-white/60' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium ${
                  isUnlocked ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  Recompensa:
                </div>
                <div className={`text-sm ${
                  isUnlocked ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {reward}
                </div>
              </div>
              
              {isUnlocked && onClaim && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={() => onClaim(achievement)}
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Resgatar
                </Button>
              )}
            </div>
          </div>

          {/* Data de Desbloqueio */}
          {isUnlocked && achievement.unlockedAt && (
            <div className="mt-2 text-xs text-gray-500">
              Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AchievementCard;
