import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'avatar', 'role', 'createdAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'avatar', 'role', 'isActive', 'createdAt', 'notificationPreferences', 'refreshToken'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithResetToken(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'avatar', 'role', 'isActive', 'emailVerified', 'refreshToken', 'resetToken', 'resetTokenExpires', 'notificationPreferences', 'createdAt', 'updatedAt'],
    });
  }

  async findByIdWithResetToken(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'avatar', 'role', 'isActive', 'emailVerified', 'refreshToken', 'resetToken', 'resetTokenExpires', 'notificationPreferences', 'createdAt', 'updatedAt'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(id, { refreshToken });
  }

  async updateNotificationPreferences(id: string, preferences: any): Promise<User> {
    const user = await this.findOne(id);
    user.notificationPreferences = {
      ...(user.notificationPreferences || {}),
      ...preferences,
    };
    return this.usersRepository.save(user);
  }

  async updateResetToken(id: string, resetToken: string | null, resetTokenExpires: Date | null): Promise<void> {
    await this.usersRepository.update(id, { resetToken, resetTokenExpires });
  }
}

