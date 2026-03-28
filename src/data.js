// --- LEVEL CONFIGURATION ---
export const LEVELS = [
  {
    id: 1,
    name: "The Alchemist's Study",
    timeLimit: 60,
    backgroundImage: '/assets/levels/level2.png', 
    itemsToFind: [
      {
        id: 'cauldron',
        name: 'Cauldron',
        icon: '/assets/levels/items-level1/item1.png', 
        hitbox: { top: 61, left: 87, width: 7, height: 13 } 
      },
      {
        id: 'leaves',
        name: 'Leaves',
        icon: '/assets/levels/items-level1/item2.png',
        hitbox: { top: 57, left: 39, width: 6, height: 6 }
      },
      {
        id: 'potion',
        name: 'Potion',
        icon: '/assets/levels/items-level1/item3.png',
        hitbox: { top: 10, left: 15.5, width: 2, height: 10 }
      },
    ]
  },
  {
    id: 2,
    name: "The Builder's Den",
    timeLimit: 60,
    backgroundImage: '/assets/levels/level1.png', 
    itemsToFind: [
      {
        id: 'threads',
        name: 'Threads',
        icon: '/assets/levels/items-level2/item2-1.png', 
        hitbox: { top: 14.5, left: 87, width: 3, height: 8 } 
      },
      {
        id: 'book',
        name: 'Book',
        icon: '/assets/levels/items-level2/item2-2.png',
        hitbox: { top: 69, left: 52, width: 2, height: 12 }
      },
      {
        id: 'compass',
        name: 'Compass',
        icon: '/assets/levels/items-level2/item2-3.png',
        hitbox: { top: 14, left: 57, width: 3, height: 4.5 }
      },
      {

        id: 'wrench',
        name: 'Wrench',
        icon: '/assets/levels/items-level2/item2-4.png',
        hitbox: { top: 54, left: 20.5, width: 5, height: 2 }
      },
    ]
  }
];