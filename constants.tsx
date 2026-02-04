
import { MenuItem } from './types';
import { INITIAL_MENU_ITEMS } from './data/initialData';

// Constants kept for backward compatibility if any legacy component imports them directly, 
// though CustomerApp now uses the hook.
export const MENU_ITEMS: MenuItem[] = INITIAL_MENU_ITEMS;

export const SPECIAL_OFFERS = MENU_ITEMS.filter(item => item.id === 'k5');

// Items available for redemption
export const REWARDS_MENU: MenuItem[] = [
  {
    ...MENU_ITEMS[0], // Momo
    id: 'rew-momo',
    pointCost: 800
  },
  {
    ...MENU_ITEMS[5], // Coke
    id: 'rew-coke',
    pointCost: 150
  }
];
