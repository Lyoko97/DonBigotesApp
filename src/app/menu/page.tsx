'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Dish } from '@/types/dish';

export default function MenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario para nuevo platillo
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('almuerzo');

  const fetchDishes = async () => {
    try {
      const response = await axios.get('/api/dishes');
      setDishes(response.data);
    } catch (error) {
      console.error('Error al obtener platillos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDishes = async () => {
      await fetchDishes();
    };
    loadDishes();
  }, []);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put('/api/dishes', { id, available: !currentStatus });
      fetchDishes();
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      await axios.post('/api/dishes', { name, description, price, category });
      setName('');
      setDescription('');
      setPrice('');
      fetchDishes();
    } catch (error) {
      console.error('Error al crear platillo:', error);
    }
  };

  const handleDeleteDish = async (id: string) => {
    try {
      await axios.delete(`/api/dishes?id=${id}`);
      fetchDishes();
    } catch (error) {
      console.error('Error al eliminar platillo:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Menú - Don Bigotes</h1>
        <p className="text-gray-600 mb-6">Módulo Persona 2: Control Completo de Platillos (CRUD) y Disponibilidad</p>

        {/* Formulario Crear Platillo */}
        <form onSubmit={handleCreateDish} className="bg-white p-5 rounded-lg shadow border border-gray-200 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Agregar Nuevo Platillo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded text-sm w-full"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio ($)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-2 rounded text-sm w-full"
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 rounded text-sm w-full"
            >
              <option value="almuerzo">Almuerzo</option>
              <option value="mexicana">Mexicana</option>
              <option value="bebida">Bebida</option>
              <option value="postre">Postre</option>
            </select>
            <button
              type="submit"
              className="bg-amber-700 hover:bg-amber-800 text-white font-medium p-2 rounded text-sm transition-colors"
            >
              + Agregar
            </button>
          </div>
          <input
            type="text"
            placeholder="Descripción corta"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded text-sm w-full"
          />
        </form>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Cargando menú de Don Bigotes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dishes.map((dish) => (
              <div key={dish.id} className="bg-white p-5 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{dish.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">${dish.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                        title="Eliminar platillo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{dish.description}</p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded capitalize mb-4">
                    {dish.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`text-sm font-medium ${dish.available ? 'text-green-600' : 'text-red-500'}`}>
                    {dish.available ? '● Disponible' : '○ Agotado'}
                  </span>
                  <button
                    onClick={() => toggleAvailability(dish.id, dish.available)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      dish.available
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {dish.available ? 'Marcar Agotado' : 'Marcar Disponible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}