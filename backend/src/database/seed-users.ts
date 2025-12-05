import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';

async function seedUsers() {
  const isProduction = process.env.NODE_ENV === 'production';
  const passwordEnv = process.env.DATABASE_PASSWORD;
  
  if (isProduction && !passwordEnv) {
    throw new Error('DATABASE_PASSWORD environment variable is required in production');
  }
  
  const password = passwordEnv ? String(passwordEnv) : undefined;
  
  if (!password) {
    throw new Error(
      'DATABASE_PASSWORD environment variable is required.\n' +
      'Set it in your .env file before running seed:users'
    );
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: password as string,
    database: process.env.DATABASE_NAME || 'taskmaster',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = dataSource.getRepository(User);

    // Admin user configuration
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

    // Regular user configuration
    const userEmail = process.env.USER_EMAIL;
    const userPassword = process.env.USER_PASSWORD;
    const userFirstName = process.env.USER_FIRST_NAME || 'John';
    const userLastName = process.env.USER_LAST_NAME || 'Doe';

    // Validate required environment variables
    if (!adminEmail || !adminPassword) {
      throw new Error(
        'ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.\n' +
        'Set them in your .env file before running seed:users'
      );
    }

    if (!userEmail || !userPassword) {
      throw new Error(
        'USER_EMAIL and USER_PASSWORD environment variables are required.\n' +
        'Set them in your .env file before running seed:users'
      );
    }

    console.log('\n📝 Seeding users...\n');

    // Create or update admin user
    let existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin user with email ${adminEmail} already exists`);
      if (existingAdmin.role !== UserRole.ADMIN) {
        existingAdmin.role = UserRole.ADMIN;
        await userRepository.save(existingAdmin);
        console.log(`✅ Updated existing user to admin role`);
      } else {
        console.log(`✅ Admin user already exists with admin role`);
      }
    } else {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      const admin = userRepository.create({
        email: adminEmail,
        password: hashedAdminPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: UserRole.ADMIN,
        isActive: true,
        emailVerified: true,
      });

      await userRepository.save(admin);
      console.log('✅ Admin user created successfully!');
      console.log(`   📧 Email: ${adminEmail}`);
      console.log(`   🔑 Password: ${adminPassword}`);
      console.log(`   👤 Name: ${adminFirstName} ${adminLastName}`);
      console.log(`   🔐 Role: ${admin.role}\n`);
    }

    // Create or update regular user
    let existingUser = await userRepository.findOne({
      where: { email: userEmail },
    });

    if (existingUser) {
      console.log(`⚠️  User with email ${userEmail} already exists`);
      if (existingUser.role !== UserRole.USER) {
        existingUser.role = UserRole.USER;
        await userRepository.save(existingUser);
        console.log(`✅ Updated existing user to regular user role`);
      } else {
        console.log(`✅ User already exists with user role`);
      }
    } else {
      const hashedUserPassword = await bcrypt.hash(userPassword, 10);
      const user = userRepository.create({
        email: userEmail,
        password: hashedUserPassword,
        firstName: userFirstName,
        lastName: userLastName,
        role: UserRole.USER,
        isActive: true,
        emailVerified: true,
      });

      await userRepository.save(user);
      console.log('✅ Regular user created successfully!');
      console.log(`   📧 Email: ${userEmail}`);
      console.log(`   🔑 Password: ${userPassword}`);
      console.log(`   👤 Name: ${userFirstName} ${userLastName}`);
      console.log(`   🔐 Role: ${user.role}\n`);
    }

    await dataSource.destroy();
    console.log('✅ User seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   👑 Admin: ${adminEmail}`);
    console.log(`   👤 User: ${userEmail}`);
    console.log('\n⚠️  Remember to change these passwords after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the seed function
seedUsers();

