import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Mail, Shield, Users, UserCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const UserRoleManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Jean Mbarga',
      email: 'jean.mbarga@entreprise.cm',
      role: 'Admin',
      status: 'Actif',
      lastLogin: '2025-06-20 14:30',
      dateCreated: '2025-01-15'
    },
    {
      id: 2,
      name: 'Marie Fotso',
      email: 'marie.fotso@entreprise.cm',
      role: 'Utilisateur Standard',
      status: 'Actif',
      lastLogin: '2025-06-22 09:15',
      dateCreated: '2025-02-10'
    },
    {
      id: 3,
      name: 'Paul Nkomo',
      email: 'paul.nkomo@entreprise.cm',
      role: 'Utilisateur Standard',
      status: 'Inactif',
      lastLogin: '2025-06-10 16:45',
      dateCreated: '2025-03-05'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Utilisateur Standard',
    sendInvite: true
  });

  const roles = [
    {
      name: 'Admin',
      description: 'Accès complet à toutes les fonctionnalités, gestion des utilisateurs et facturation',
      color: 'bg-purple-100 text-purple-800',
      icon: Shield
    },
    {
      name: 'Utilisateur Standard',
      description: 'Accès aux modules d\'analyse et d\'optimisation, sans paramètres critiques',
      color: 'bg-blue-100 text-blue-800',
      icon: Users
    }
  ];

  const handleCreateUser = () => {
    setModalType('create');
    setFormData({ name: '', email: '', role: 'Utilisateur Standard', sendInvite: true });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalType('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      sendInvite: false
    });
    setShowModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Actif' ? 'Inactif' : 'Actif' }
        : user
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'create') {
      const newUser = {
        id: users.length + 1,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'Actif',
        lastLogin: 'Jamais connecté',
        dateCreated: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
    } else {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, name: formData.name, email: formData.email, role: formData.role }
          : user
      ));
    }
    setShowModal(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Tous' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status) => {
    return status === 'Actif' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRoleBadge = (role) => {
    const roleInfo = roles.find(r => r.name === role);
    return roleInfo ? roleInfo.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 text-blue-600" size={32} />
              Gestion des Utilisateurs et Rôles
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les accès et permissions de votre équipe InventoryAI Enterprise
            </p>
          </div>
          <button
            onClick={handleCreateUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors"
          >
            <Plus className="mr-2" size={20} />
            Inviter un utilisateur
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'Actif').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Administrateurs</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'Admin').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Shield className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Invitations Pending</p>
              <p className="text-2xl font-bold text-orange-600">0</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Mail className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Roles Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rôles et Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <role.icon className="mr-2 text-gray-600" size={20} />
                  <span className="font-medium text-gray-900">{role.name}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                  {users.filter(u => u.role === role.name).length} utilisateur(s)
                </span>
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Tous">Tous les rôles</option>
              <option value="Admin">Admin</option>
              <option value="Utilisateur Standard">Utilisateur Standard</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredUsers.length} utilisateur(s) affiché(s)
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Connexion
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de Création
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.dateCreated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Modifier"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`transition-colors ${user.status === 'Actif' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                        title={user.status === 'Actif' ? 'Désactiver' : 'Activer'}
                      >
                        {user.status === 'Actif' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {modalType === 'create' ? 'Inviter un nouvel utilisateur' : 'Modifier l\'utilisateur'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Jean Mbarga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="exemple@entreprise.cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Utilisateur Standard">Utilisateur Standard</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {roles.find(r => r.name === formData.role)?.description}
                  </p>
                </div>
              </div>

              {modalType === 'create' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendInvite"
                    checked={formData.sendInvite}
                    onChange={(e) => setFormData({...formData, sendInvite: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sendInvite" className="ml-2 text-sm text-gray-700">
                    Envoyer un email d'invitation
                  </label>
                </div>
              )}

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {modalType === 'create' ? 'Inviter' : 'Modifier'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleManagement;