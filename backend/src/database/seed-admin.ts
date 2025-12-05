import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';

async function seedAdmin() {
  const isProduction = process.env.NODE_ENV === 'production';
  const passwordEnv = process.env.DATABASE_PASSWORD;
  // Try common default passwords if not set
  // In production, require DATABASE_PASSWORD to be set
  if (isProduction && !passwordEnv) {
    throw new Error('DATABASE_PASSWORD environment variable is required in production');
  }
  
  // In development, warn if using default password
  const password = passwordEnv ? String(passwordEnv) : (isProduction ? undefined : undefined);
  
  if (!password) {
    throw new Error(
      'DATABASE_PASSWORD environment variable is required.\n' +
      'Set it in your .env file before running seed:admin'
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

    // Default admin credentials
    // ⚠️ IMPORTANT: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables
    // For production, these MUST be set - no defaults allowed
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      throw new Error(
        'ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.\n' +
        'Set them in your .env file or as environment variables before running seed:admin'
      );
    }
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin user with email ${adminEmail} already exists`);
      
      // Update to admin role if not already
      if (existingAdmin.role !== UserRole.ADMIN) {
        existingAdmin.role = UserRole.ADMIN;
        await userRepository.save(existingAdmin);
        console.log(`✅ Updated existing user to admin role`);
      } else {
        console.log(`✅ Admin user already exists with admin role`);
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: UserRole.ADMIN,
        isActive: true,
        emailVerified: true,
      });

      await userRepository.save(admin);
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log(`👤 Name: ${adminFirstName} ${adminLastName}`);
      console.log(`🔐 Role: ${admin.role}`);
    }

    await dataSource.destroy();
    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();

