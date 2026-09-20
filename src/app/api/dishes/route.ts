import { NextResponse } from 'next/server';
import { Dish } from '@/types/dish';

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

// GET: Listar platillos
export async function GET() {
  return NextResponse.json(initialDishes);
}

// POST: Crear nuevo platillo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDish: Dish = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description,
      price: Number(body.price),
      category: body.category || 'general',
      available: true,
      stock: body.stock ? Number(body.stock) : 10
    };

    initialDishes.push(newDish);
    return NextResponse.json({ message: 'Platillo creado', dish: newDish }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear el platillo' }, { status: 500 });
  }
}

// PUT: Actualizar estado o datos de platillo
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

    return NextResponse.json({ message: 'Platillo actualizado', dishes: initialDishes });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar platillo' }, { status: 500 });
  }
}

// DELETE: Eliminar un platillo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    initialDishes = initialDishes.filter((dish) => dish.id !== id);
    return NextResponse.json({ message: 'Platillo eliminado' });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar platillo' }, { status: 500 });
  }
}