
import { MenuItem, Category } from '../types';

export const INITIAL_CATEGORIES_DATA = [
  { id: 'cat_all', name: 'All', type: 'both', image: '' },
  { id: 'cat_momo', name: 'Momo', type: 'cooked', image: 'https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat_pizza', name: 'Pizza', type: 'cooked', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat_burger', name: 'Burger', type: 'cooked', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat_noodles', name: 'Noodles', type: 'cooked', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat_drinks', name: 'Drinks', type: 'instant', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat_alcohol', name: 'Alcohol', type: 'instant', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat_smoke', name: 'Smoke', type: 'instant', image: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&q=80&w=200' },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // --- KITCHEN ITEMS (requiresPreparation: true) ---
  {
    id: 'k1',
    name: 'Steam Veg Momo',
    price: 200,
    category: 'Momo' as any,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?auto=format&fit=crop&q=80&w=600',
    description: 'Juicy vegetable dumplings served with spicy sesame chutney.',
    time: '15 min',
    requiresPreparation: true,
    isAvailable: true
  },
  {
    id: 'k2',
    name: 'Chicken C. Momo',
    price: 350,
    category: 'Momo' as any,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600',
    description: 'Fried chicken momos tossed in spicy chili sauce, bell peppers and onions.',
    time: '20 min',
    requiresPreparation: true,
    isAvailable: true
  },
  {
    id: 'k3',
    name: 'Margherita Pizza',
    price: 550,
    category: 'Pizza' as any,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600',
    description: 'Classic cheese pizza with tomato sauce and fresh basil.',
    time: '25 min',
    requiresPreparation: true,
    isAvailable: true
  },
  {
    id: 'k4',
    name: 'Chicken Burger',
    price: 450,
    category: 'Burger' as any,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
    description: 'Crispy chicken patty with lettuce, tomato, and special sauce.',
    time: '20 min',
    requiresPreparation: true,
    isAvailable: true
  },
  {
    id: 'k5',
    name: 'Spicy Hakka Noodles',
    price: 300,
    category: 'Noodles' as any,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600',
    description: 'Stir-fried noodles with fresh vegetables and schezwan sauce.',
    time: '15 min',
    requiresPreparation: true,
    isAvailable: true
  },

  // --- BAR / INSTANT ITEMS (requiresPreparation: false) ---
  {
    id: 'b1',
    name: 'Coca-Cola',
    price: 100,
    category: 'Drinks' as any,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600',
    description: 'Chilled 500ml bottle.',
    time: 'Instant',
    requiresPreparation: false,
    servingUnit: 'Bottle',
    isAvailable: true
  },
  {
    id: 'b2',
    name: 'Tuborg Beer',
    price: 650,
    category: 'Alcohol' as any,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1623329227563-34449079c73a?auto=format&fit=crop&q=80&w=600',
    description: 'Premium lager beer, served chilled.',
    time: 'Instant',
    requiresPreparation: false,
    servingUnit: 'Bottle',
    isAvailable: true
  },
  {
    id: 'b3',
    name: 'Old Durbar (60ml)',
    price: 450,
    category: 'Alcohol' as any,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1569529465841-dfecd4962f9d?auto=format&fit=crop&q=80&w=600',
    description: 'Fine blended whisky on the rocks.',
    time: 'Instant',
    requiresPreparation: false,
    servingUnit: 'Peg',
    isAvailable: true
  },
  {
    id: 'b4',
    name: 'Mint Mojito',
    price: 400,
    category: 'Drinks' as any,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=600',
    description: 'Refreshing mint and lime mocktail.',
    time: '5 min',
    requiresPreparation: false, // Bartender prepares, but treated as Bar flow
    servingUnit: 'Glass',
    isAvailable: true
  },
  {
    id: 'b5',
    name: 'Surya Red',
    price: 50,
    category: 'Smoke' as any,
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1520033038318-7b9c9f4d762f?auto=format&fit=crop&q=80&w=600',
    description: 'Single stick.',
    time: 'Instant',
    requiresPreparation: false,
    servingUnit: 'Stick',
    isAvailable: true
  },
  {
    id: 'b6',
    name: 'Mint Hukka',
    price: 800,
    category: 'Smoke' as any,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&q=80&w=600',
    description: 'Premium mint flavoured sheesha.',
    time: '10 min',
    requiresPreparation: false, // Bar prepares
    servingUnit: 'Pot',
    isAvailable: true
  }
];
