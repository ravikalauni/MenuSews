
import { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { INITIAL_MENU_ITEMS, INITIAL_CATEGORIES_DATA } from '../data/initialData';

export const useMenu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES_DATA);

  // Initialize Data
  useEffect(() => {
    const loadData = () => {
      // 1. Load Items
      const storedItems = localStorage.getItem('nepnola_menu_items');
      if (storedItems) {
        try {
          setItems(JSON.parse(storedItems));
        } catch (e) {
          setItems(INITIAL_MENU_ITEMS);
        }
      } else {
        setItems(INITIAL_MENU_ITEMS);
        localStorage.setItem('nepnola_menu_items', JSON.stringify(INITIAL_MENU_ITEMS));
      }

      // 2. Load Categories
      const storedCats = localStorage.getItem('nepnola_categories');
      if (storedCats) {
        try {
          setCategories(JSON.parse(storedCats));
        } catch (e) {
          setCategories(INITIAL_CATEGORIES_DATA);
        }
      } else {
        setCategories(INITIAL_CATEGORIES_DATA);
        localStorage.setItem('nepnola_categories', JSON.stringify(INITIAL_CATEGORIES_DATA));
      }
    };

    loadData();

    // Listen for cross-tab updates
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    // Custom event for same-tab updates
    window.addEventListener('menu_updated', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('menu_updated', handleStorage);
    };
  }, []);

  const saveItems = (newItems: MenuItem[]) => {
    setItems(newItems);
    localStorage.setItem('nepnola_menu_items', JSON.stringify(newItems));
    window.dispatchEvent(new Event('menu_updated'));
  };

  const saveCategories = (newCats: any[]) => {
    setCategories(newCats);
    localStorage.setItem('nepnola_categories', JSON.stringify(newCats));
    window.dispatchEvent(new Event('menu_updated'));
  };

  const addItem = (item: MenuItem) => {
    saveItems([item, ...items]);
  };

  const updateItem = (updatedItem: MenuItem) => {
    saveItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const deleteItem = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
  };

  return {
    items,
    categories,
    addItem,
    updateItem,
    deleteItem,
    saveCategories
  };
};
