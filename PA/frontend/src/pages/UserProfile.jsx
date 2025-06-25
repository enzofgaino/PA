
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Calendar, Award, Zap, DollarSign, TreePine, Settings, MapPin, Sun, Cloud } from 'lucide-react';

function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    address: '',
    cep: ''
  });
  const [achievements, setAchievements] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [solarPotential, setSolarPotential] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadAchievements();
    }
  }, [user]);

  const loadUserProfile = () => {
    const users = JSON.parse(localStorage.getItem('solar_users') || '[]');
    const currentUser = users.find(u => u.id === user.id);
    if (currentUser) {
      setProfileData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        cep: currentUser.cep || ''
      });
      
      if (currentUser.cep) {
        fetchWeatherData(currentUser.cep);
      }
    }
  };

  const loadAchievements = () => {
    const energyRecords = JSON.parse(localStorage.getItem('energy_records') || '[]');
    const userRecords = energyRecords.filter(record => record.userId === user?.id);
    
    const totalSaved = userRecords.reduce((sum, record) => sum + (record.energySaved || 0), 0);
    const totalFinancial = userRecords.reduce((sum, record) => sum + (record.financialSavings || 0), 0);
    const totalTrees = userRecords.reduce((sum, record) => sum + (record.treesSaved || 0), 0);

    const achievementsList = [];

    if (totalSaved >= 100) achievementsList.push({ id: 1, name: 'Produtor', description: '100 kWh economizados', icon: 'zap', color: 'yellow' });
    if (totalFinancial >= 100) achievementsList.push({ id: 2, name: 'Economista', description: 'R$ 100 economizados', icon: 'dollar', color: 'green' });
    if (totalTrees >= 5) achievementsList.push({ id: 3, name: 'Ecologista', description: '5 árvores salvas', icon: 'tree', color: 'green' });
    if (totalSaved >= 500) achievementsList.push({ id: 4, name: 'Mestre', description: '500 kWh economizados', icon: 'award', color: 'gray' });
    if (totalFinancial >= 500) achievementsList.push({ id: 5, name: 'Campeão', description: 'R$ 500 economizados', icon: 'award', color: 'gray' });
    if (totalTrees >= 20) achievementsList.push({ id: 6, name: 'Guardião', description: '20 árvores salvas', icon: 'tree', color: 'gray' });

    setAchievements(achievementsList);
  };

  const fetchAddressByCep = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        setProfileData(prev => ({ ...prev, address: fullAddress }));
        return data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  };

  const fetchWeatherData = async (cep) => {
    try {
      const addressData = await fetchAddressByCep(cep);
      if (addressData) {
        // Simulação de dados climáticos (em produção, usar API real)
        const mockWeatherData = {
          temperature: Math.floor(Math.random() * 15) + 20,
          condition: 'Ensolarado',
          humidity: Math.floor(Math.random() * 30) + 50,
          uvIndex: Math.floor(Math.random() * 5) + 6,
          solarPotential: Math.floor(Math.random() * 3) + 7
        };
        
        setWeatherData(mockWeatherData);
        setSolarPotential({
          maxPanels: 500,
          sunHours: 1500,
          annualProduction: 10000,
          annualSavings: 7500
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados climáticos:', error);
    }
  };

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setProfileData(prev => ({ ...prev, cep }));
    
    if (cep.length === 8) {
      await fetchWeatherData(cep);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('solar_users') || '[]');
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, ...profileData }
          : u
      );
      
      localStorage.setItem('solar_users', JSON.stringify(updatedUsers));
      
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Ocorreu um erro ao salvar suas informações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (iconType) => {
    switch (iconType) {
      case 'zap': return <Zap className="w-6 h-6" />;
      case 'dollar': return <DollarSign className="w-6 h-6" />;
      case 'tree': return <TreePine className="w-6 h-6" />;
      case 'award': return <Award className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
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
            <User className="w-8 h-8 mr-3 text-green-600" />
            Meu Perfil
          </h1>
          <p className="text-gray-600">Gerencie suas informações pessoais, endereço, veja seu potencial solar e suas conquistas.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                    <Settings className="w-6 h-6 mr-2 text-blue-600" />
                    Atualizar Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-gray-700 font-medium">Nome de Usuário</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                          className="border-gray-200 focus:border-blue-400"
                          disabled
                        />
                        <p className="text-xs text-gray-500">Nome de usuário não pode ser alterado.</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="border-gray-200 focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cep" className="text-gray-700 font-medium">CEP</Label>
                      <Input
                        id="cep"
                        value={profileData.cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={8}
                        className="border-gray-200 focus:border-blue-400"
                      />
                    </div>

                    {profileData.address && (
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Endereço
                        </Label>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800">{profileData.address}</p>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {loading ? 'Atualizando...' : 'Atualizar Endereço e Ver Potencial Solar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {solarPotential && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <Sun className="w-6 h-6 mr-2" />
                      Potencial Solar Estimado
                    </CardTitle>
                    <p className="text-green-100 text-sm">Estimativa baseada nos dados da Google Solar API para a localização do seu endereço.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white/20 rounded-lg">
                        <p className="text-2xl font-bold text-cyan-300">{solarPotential.maxPanels}</p>
                        <p className="text-green-100 text-sm">Máximo de Painéis Solares</p>
                      </div>
                      <div className="text-center p-3 bg-white/20 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-300">{solarPotential.sunHours} h</p>
                        <p className="text-green-100 text-sm">Horas de Sol Anuais (Média)</p>
                      </div>
                      <div className="text-center p-3 bg-white/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-300">{solarPotential.annualProduction} kWh</p>
                        <p className="text-green-100 text-sm">Produção Anual Estimada (Exemplo)</p>
                      </div>
                      <div className="text-center p-3 bg-white/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-300">R$ {solarPotential.annualSavings.toFixed(2)}</p>
                        <p className="text-green-100 text-sm">Economia Anual Estimada</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                    <Award className="w-6 h-6 mr-2 text-green-600" />
                    Minhas Conquistas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg text-center achievement-glow ${
                            achievement.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            achievement.color === 'green' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            {getAchievementIcon(achievement.icon)}
                          </div>
                          <p className="font-bold text-sm">{achievement.name}</p>
                          <p className="text-xs opacity-80">{achievement.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma conquista ainda</p>
                      <p className="text-sm text-gray-500">Continue economizando energia para desbloquear conquistas!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {weatherData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="weather-card text-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Cloud className="w-5 h-5 mr-2" />
                      Condições Climáticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Temperatura:</span>
                        <span className="font-bold">{weatherData.temperature}°C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Condição:</span>
                        <span className="font-bold">{weatherData.condition}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Umidade:</span>
                        <span className="font-bold">{weatherData.humidity}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Índice UV:</span>
                        <span className="font-bold">{weatherData.uvIndex}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Potencial Solar:</span>
                        <Badge variant="success" className="bg-yellow-400 text-yellow-900">
                          {weatherData.solarPotential}/10
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Resumo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{user?.username}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Membro desde {new Date(user?.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserProfile;
