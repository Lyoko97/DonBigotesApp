import { NextResponse } from 'next/server';
import { Dish } from '@/types/dish';

// Base de datos simulada en memoria para la Persona 2
let initialDishes: Dish[] = [
  {
    id: '1',
    name: 'Tacos al Pastor',
    description: '3 tacos de carne al pastor con piña, cilantro y cebolla.',
    price: 4.50,
    category: 'mexicana',
    available: true,
    stock: 15
  },
  {
    id: '2',
    name: 'Plato Ejecutivo de Pollo',
    description: 'Pechuga a la plancha, arroz, ensalada y frijoles.',
    price: 5.25,
    category: 'almuerzo',
    available: true,
    stock: 8
  },
  {
    id: '3',
    name: 'Horchata Artesanal',
    description: 'Bebida tradicional de morro 500ml.',
    price: 1.50,
    category: 'bebida',
    available: true,
    stock: 20
  },
  {
    id: '4',
    name: 'Flan de la Casa',
    description: 'Postre cremoso bañado en caramelo.',
    price: 2.00,
    category: 'postre',
    available: false,
    stock: 0
  }
];

// GET: Obtener la lista de platillos
export async function GET() {
  return NextResponse.json(initialDishes);
}

// PUT: Actualizar estado de disponibilidad o datos de un platillo
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, available, stock } = body;

    initialDishes = initialDishes.map((dish) => {
      if (dish.id === id) {
        return {
          ...dish,
          ...(available !== undefined && { available }),
          ...(stock !== undefined && { stock })
        };
      }
      return dish;
    });

    return NextResponse.json({ message: 'Platillo actualizado con éxito', dishes: initialDishes });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar platillo' }, { status: 500 });
  }
}