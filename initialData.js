
export const INITIAL_CATEGORIES = [
  { id: 'cat_all', name: 'All', image: '🍽️' },
  { id: 'cat_momo', name: 'Momo', image: '🥟' },
  { id: 'cat_pizza', name: 'Pizza', image: '🍕' },
  { id: 'cat_burger', name: 'Burger', image: '🍔' },
  { id: 'cat_drinks', name: 'Drinks', image: '🥤' }
];

export const INITIAL_MENU = [
  {
    id: 'k1',
    name: 'Steam Veg Momo',
    price: 200,
    category: 'Momo',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?auto=format&fit=crop&q=80&w=600',
    description: 'Juicy vegetable dumplings served with spicy sesame chutney.',
    time: '15 min'
  },
  {
    id: 'k2',
    name: 'Chicken Pizza',
    price: 550,
    category: 'Pizza',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
    description: 'Fresh baked pizza with organic chicken and mozzarella.',
    time: '25 min'
  },
  {
    id: 'b1',
    name: 'Coca-Cola',
    price: 100,
    category: 'Drinks',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600',
    description: 'Chilled 500ml bottle.',
    time: 'Instant'
  }
];
