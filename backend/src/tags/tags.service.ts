import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) return [];
    return this.tagsRepository.find({
      where: { id: In(ids) },
    });
  }

  async findOrCreate(tagNames: string[]): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) return [];

    const tags: Tag[] = [];
    const defaultColors = [
      '#ec4899', // pink
      '#a855f7', // purple
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
    ];

    for (let i = 0; i < tagNames.length; i++) {
      const name = tagNames[i].trim().toLowerCase();
      if (!name) continue;

      let tag = await this.tagsRepository.findOne({
        where: { name },
      });

      if (!tag) {
        const color = defaultColors[i % defaultColors.length];
        tag = this.tagsRepository.create({
          name,
          color,
        });
        tag = await this.tagsRepository.save(tag);
      }

      tags.push(tag);
    }

    return tags;
  }

  async create(name: string, color?: string): Promise<Tag> {
    const tag = this.tagsRepository.create({
      name: name.trim().toLowerCase(),
      color: color || '#ec4899',
    });
    return this.tagsRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    await this.tagsRepository.delete(id);
  }
}

