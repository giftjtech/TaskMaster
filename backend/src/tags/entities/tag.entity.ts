import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  color: string;

  @ManyToMany(() => Task, (task) => task.tags)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;
}

