'use strict';

// Using only VERIFIED working image IDs from the previous run
const IMG_BURGER = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80';
const IMG_PIZZA = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80';
const IMG_CURRY = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=80';
const IMG_FRIES = 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80';
const IMG_WINGS = 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?auto=format&fit=crop&w=500&q=80';
const IMG_STRAWBERRY = 'https://images.unsplash.com/photo-1553177595-4de2bb0842b9?auto=format&fit=crop&w=500&q=80';
const IMG_MANGO = 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80';
const IMG_ICED_TEA = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80';
const IMG_MOJITO = 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=500&q=80';
const IMG_ICE_CREAM = 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=500&q=80';
const IMG_BROWNIE = 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Branches', [{
      name: 'Downtown Main',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    await queryInterface.bulkInsert('Inventories', [
      {
        branch_id: 1,
        item_name: 'Burger Buns',
        quantity: 500,
        unit: 'pieces',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    await queryInterface.bulkInsert('MenuItems', [
      // Mains (8 Items)
      { name: 'Aloo Tikki Burger', description: 'Crispy potato patty with fresh lettuce', price: 60, category: 'Mains', image_url: IMG_BURGER, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Veg Cheese Burger', description: 'Loaded with veggies and extra cheese', price: 90, category: 'Mains', image_url: IMG_BURGER, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chicken Burger', description: 'Juicy chicken patty with mayo', price: 110, category: 'Mains', image_url: IMG_BURGER, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Margherita Pizza', description: 'Classic cheese and tomato', price: 150, category: 'Mains', image_url: IMG_PIZZA, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Farmhouse Pizza', description: 'Loaded with fresh garden veggies', price: 220, category: 'Mains', image_url: IMG_PIZZA, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Paneer Tikka Pizza', description: 'Spicy paneer chunks with veggies', price: 280, category: 'Mains', image_url: IMG_PIZZA, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Paneer Butter Masala', description: 'Rich creamy paneer curry', price: 190, category: 'Mains', image_url: IMG_CURRY, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Butter Chicken', description: 'Tender chicken in rich tomato gravy', price: 240, category: 'Mains', image_url: IMG_CURRY, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Sides (5 Items)
      { name: 'Classic Salted Fries', description: 'Crispy golden potato fries', price: 70, category: 'Sides', image_url: IMG_FRIES, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Peri Peri Fries', description: 'Spicy peri peri seasoned fries', price: 90, category: 'Sides', image_url: IMG_FRIES, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Cheesy Loaded Fries', description: 'Fries loaded with liquid cheese', price: 130, category: 'Sides', image_url: IMG_FRIES, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Spicy Chicken Wings', description: 'Crispy fried spicy wings (6 pcs)', price: 180, category: 'Sides', image_url: IMG_WINGS, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'BBQ Chicken Wings', description: 'Wings tossed in sweet BBQ sauce', price: 190, category: 'Sides', image_url: IMG_WINGS, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Drinks (5 Items)
      { name: 'Mango Lassi', description: 'Sweet mango and yogurt drink', price: 80, category: 'Drinks', image_url: IMG_MANGO, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Strawberry Shake', description: 'Fresh strawberry blended shake', price: 120, category: 'Drinks', image_url: IMG_STRAWBERRY, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Virgin Mojito', description: 'Mint and lime mocktail', price: 90, category: 'Drinks', image_url: IMG_MOJITO, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lemon Iced Tea', description: 'Refreshing lemon iced tea', price: 70, category: 'Drinks', image_url: IMG_ICED_TEA, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Cold Coffee', description: 'Classic blended iced coffee', price: 110, category: 'Drinks', image_url: IMG_ICED_TEA, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Desserts (3 Items)
      { name: 'Vanilla Ice Cream', description: 'Two scoops of classic vanilla', price: 60, category: 'Desserts', image_url: IMG_ICE_CREAM, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chocolate Ice Cream', description: 'Rich dark chocolate scoops', price: 80, category: 'Desserts', image_url: IMG_ICE_CREAM, is_available: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Warm Chocolate Brownie', description: 'Warm fudgy brownie piece', price: 100, category: 'Desserts', image_url: IMG_BROWNIE, is_available: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('MenuItems', null, {});
    await queryInterface.bulkDelete('Inventories', null, {});
    await queryInterface.bulkDelete('Branches', null, {});
  }
};
