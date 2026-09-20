export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'almuerzo' | 'mexicana' | 'bebida' | 'postre';
  available: boolean; // Controla la disponibilidad dinámica en tiempo real
  stock: number;
}