import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      ownerId: userId,
    });
    return this.projectsRepository.save(project);
  }

  async findAll(userId?: string): Promise<Project[]> {
    const where = userId ? { ownerId: userId } : {};
    return this.projectsRepository.find({
      where,
      relations: ['owner', 'tasks'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['owner', 'tasks', 'tasks.assignee'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findOne(id);
    if (project.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own projects');
    }
    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id);
    if (project.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own projects');
    }
    await this.projectsRepository.remove(project);
  }
}

