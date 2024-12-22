const chalk = require('chalk');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const setupDB = require('./db');
const Product = require('../models/product');
const Brand = require('../models/brand');
const Category = require('../models/category');
const User = require('../models/user');
const { ROLES } = require('../constants');
const seedData = require('./seedData.json');

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

const seedDB = async () => {
  try {
    console.log(`${chalk.blue('✓')} ${chalk.blue('Seed database started')}`);

    // Seed Admin User
    if (!email || !password) throw new Error('Missing arguments');
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      console.log(
        `${chalk.yellow('!')} ${chalk.yellow('Seeding admin user...')}`
      );
      const user = new User({
        email,
        password,
        firstName: 'admin',
        lastName: 'admin',
        role: ROLES.Admin
      });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      await user.save();
      console.log(`${chalk.green('✓')} ${chalk.green('Admin user seeded.')}`);
    } else {
      console.log(
        `${chalk.yellow('!')} ${chalk.yellow(
          'Admin user already exists, skipping seeding for admin user.'
        )}`
      );
    }

    // Create maps for brands and categories
    const brandMap = {};
    const categoryMap = {};

    // Seed categories
    for (const category of seedData.categories) {
      const existingCategory = await Category.findOne({ name: category.name });
      if (!existingCategory) {
        const newCategory = await Category.create(category);
        categoryMap[category.name] = newCategory._id;
        console.log(`${chalk.green('✓')} Category seeded: ${category.name}`);
      } else {
        categoryMap[category.name] = existingCategory._id;
        console.log(`${chalk.yellow('!')} Category exists: ${category.name}`);
      }
    }

    // Seed brands
    for (const brand of seedData.brands) {
      const existingBrand = await Brand.findOne({ name: brand.name });
      if (!existingBrand) {
        const newBrand = await Brand.create(brand);
        brandMap[brand.name] = newBrand._id;
        console.log(`${chalk.green('✓')} Brand seeded: ${brand.name}`);
      } else {
        brandMap[brand.name] = existingBrand._id;
        console.log(`${chalk.yellow('!')} Brand exists: ${brand.name}`);
      }
    }

    // Seed products and update categories
    for (const product of seedData.products) {
      const existingProduct = await Product.findOne({ name: product.name });
      if (!existingProduct) {
        const brandId = brandMap[product.brand];
        const categoryId = categoryMap[product.category];

        if (!brandId) {
          console.error(
            `${chalk.red('x')} Brand not found for product: ${
              product.name
            }, brand: ${product.brand}`
          );
          continue;
        }
        if (!categoryId) {
          console.error(
            `${chalk.red('x')} Category not found for product: ${
              product.name
            }, category: ${product.category}`
          );
          continue;
        }

        // Create the product
        const newProduct = await Product.create({
          ...product,
          brand: brandId
        });

        // Update the category with the product reference
        await Category.updateOne(
          { _id: categoryId },
          { $push: { products: newProduct._id } }
        );

        console.log(`${chalk.green('✓')} Product seeded: ${product.name}`);
      } else {
        console.log(`${chalk.yellow('!')} Product exists: ${product.name}`);
      }
    }

    console.log(`${chalk.green('✓')} Database seeding completed successfully!`);
  } catch (error) {
    console.error(`${chalk.red('x')} Error during seeding:`, error.message);
  } finally {
    await mongoose.connection.close();
    console.log(`${chalk.blue('✓')} Database connection closed!`);
  }
};

// Initialize database and run seeding
(async () => {
  try {
    await setupDB();
    await seedDB();
  } catch (error) {
    console.error(
      `${chalk.red('x')} Failed to initialize database:`,
      error.message
    );
  }
})();
