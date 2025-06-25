
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Eye, Search, MapPin, Calendar, Zap, DollarSign, TreePine } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('solarUsers') || '[]');
    setUsers(storedUsers);
  };

  const fetchAddressByCep = async (cep) => {
    if (cep.length !== 8) return;
    
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado e tente novamente.",
          variant: "destructive"
        });
        return;
      }

      setAddressData(data);
      setNewUser(prev => ({
        ...prev,
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      }));

      toast({
        title: "Endereço encontrado!",
        description: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível buscar o endereço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setNewUser(prev => ({ ...prev, cep }));
    
    if (cep.length === 8) {
      fetchAddressByCep(cep);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.cep) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('solarUsers') || '[]');
    
    if (existingUsers.find(user => user.email === newUser.email)) {
      toast({
        title: "Email já cadastrado",
        description: "Este email já está sendo usado por outro usuário.",
        variant: "destructive"
      });
      return;
    }

    const user = {
      id: Date.now(),
      ...newUser,
      type: 'user',
      createdAt: new Date().toISOString(),
      energyData: {
        totalProduced: 0,
        totalConsumed: 0,
        totalSaved: 0,
        monthlyRecords: []
      },
      achievements: [],
      monthlyConsumption: 0
    };

    const updatedUsers = [...existingUsers, user];
    localStorage.setItem('solarUsers', JSON.stringify(updatedUsers));
    
    setUsers(updatedUsers);
    setNewUser({
      name: '',
      email: '',
      password: '',
      cep: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      country: 'Brasil'
    });
    setAddressData(null);
    setShowAddUser(false);

    toast({
      title: "Usuário cadastrado!",
      description: `${user.name} foi cadastrado com sucesso.`
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserStats = (user) => {
    const totalProduced = user.energyData?.totalProduced || 0;
    const totalSaved = user.energyData?.totalSaved || 0;
    const treesSaved = (totalProduced * 0.02).toFixed(1);
    
    return { totalProduced, totalSaved, treesSaved };
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
            <Users className="w-8 h-8 mr-3 text-green-600" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">Gerencie perfis de usuários e visualize dados de consumo.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                      <Users className="w-6 h-6 mr-2 text-green-600" />
                      Usuários do Sistema
                    </CardTitle>
                    <Button
                      onClick={() => setShowAddUser(!showAddUser)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {showAddUser && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cadastrar Novo Usuário</h3>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nome de Usuário *</Label>
                            <Input
                              id="name"
                              value={newUser.name}
                              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nome do usuário"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="email@exemplo.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="password">Senha *</Label>
                            <Input
                              id="password"
                              type="password"
                              value={newUser.password}
                              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                              placeholder="Senha do usuário"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cep">CEP *</Label>
                            <Input
                              id="cep"
                              value={newUser.cep}
                              onChange={handleCepChange}
                              placeholder="00000000"
                              maxLength={8}
                              required
                            />
                            {loadingCep && <div className="text-sm text-blue-600 mt-1">Buscando endereço...</div>}
                          </div>
                        </div>

                        {addressData && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="address">Rua</Label>
                              <Input
                                id="address"
                                value={newUser.address}
                                onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Rua/Avenida"
                              />
                            </div>
                            <div>
                              <Label htmlFor="number">Número</Label>
                              <Input
                                id="number"
                                value={newUser.number}
                                onChange={(e) => setNewUser(prev => ({ ...prev, number: e.target.value }))}
                                placeholder="123"
                              />
                            </div>
                          </div>
                        )}

                        {addressData && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="neighborhood">Bairro</Label>
                              <Input
                                id="neighborhood"
                                value={newUser.neighborhood}
                                onChange={(e) => setNewUser(prev => ({ ...prev, neighborhood: e.target.value }))}
                                placeholder="Bairro"
                              />
                            </div>
                            <div>
                              <Label htmlFor="city">Cidade</Label>
                              <Input
                                id="city"
                                value={newUser.city}
                                onChange={(e) => setNewUser(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Cidade"
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">Estado</Label>
                              <Input
                                id="state"
                                value={newUser.state}
                                onChange={(e) => setNewUser(prev => ({ ...prev, state: e.target.value }))}
                                placeholder="UF"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            Cadastrar Usuário
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddUser(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado ainda.'}
                      </div>
                    ) : (
                      filteredUsers.map((user, index) => {
                        const stats = getUserStats(user);
                        return (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <h3 className="font-semibold text-gray-800 mr-3">{user.name}</h3>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {user.type === 'admin' ? 'Administrador' : 'Usuário'}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                                
                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span>{user.city}, {user.state}</span>
                                  <Calendar className="w-4 h-4 ml-4 mr-1" />
                                  <span>Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center p-2 bg-yellow-50 rounded">
                                    <Zap className="w-4 h-4 mx-auto text-yellow-600 mb-1" />
                                    <div className="text-sm font-semibold text-yellow-700">{stats.totalProduced} kWh</div>
                                    <div className="text-xs text-gray-600">Energia Produzida</div>
                                  </div>
                                  <div className="text-center p-2 bg-green-50 rounded">
                                    <DollarSign className="w-4 h-4 mx-auto text-green-600 mb-1" />
                                    <div className="text-sm font-semibold text-green-700">R$ {stats.totalSaved}</div>
                                    <div className="text-xs text-gray-600">Total Economizado</div>
                                  </div>
                                  <div className="text-center p-2 bg-emerald-50 rounded">
                                    <TreePine className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                                    <div className="text-sm font-semibold text-emerald-700">{stats.treesSaved}</div>
                                    <div className="text-xs text-gray-600">Árvores Salvas</div>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                                className="ml-4"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-800">Estatísticas Gerais</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                      <div className="text-sm text-gray-600">Usuários Cadastrados</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {users.reduce((sum, user) => sum + (user.energyData?.totalProduced || 0), 0).toFixed(1)} kWh
                      </div>
                      <div className="text-sm text-gray-600">Energia Total Produzida</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        R$ {users.reduce((sum, user) => sum + (user.energyData?.totalSaved || 0), 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Economia Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedUser && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-lg font-semibold text-gray-800">Detalhes do Usuário</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-800">{selectedUser.name}</h4>
                          <p className="text-gray-600 text-sm">{selectedUser.email}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Endereço:</h5>
                          <p className="text-sm text-gray-600">
                            {selectedUser.address}, {selectedUser.number}<br />
                            {selectedUser.neighborhood}<br />
                            {selectedUser.city} - {selectedUser.state}<br />
                            CEP: {selectedUser.cep}
                          </p>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Dados Energéticos:</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Energia Produzida:</span>
                              <span className="font-semibold">{selectedUser.energyData?.totalProduced || 0} kWh</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Energia Consumida:</span>
                              <span className="font-semibold">{selectedUser.energyData?.totalConsumed || 0} kWh</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Economizado:</span>
                              <span className="font-semibold text-green-600">R$ {selectedUser.energyData?.totalSaved || 0}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => setSelectedUser(null)}
                          className="w-full"
                        >
                          Fechar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUserManagement;
