import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('task-stats')
  @ApiOperation({ summary: 'Get task statistics' })
  getTaskStats(@CurrentUser() user: any) {
    return this.analyticsService.getTaskStats(user.userId);
  }

  @Get('completion-rate')
  @ApiOperation({ summary: 'Get task completion rate' })
  getCompletionRate(@CurrentUser() user: any, @Query('days') days?: string) {
    return this.analyticsService.getTaskCompletionRate(user.userId, days ? parseInt(days) : 30);
  }

  @Get('tasks-by-priority')
  @ApiOperation({ summary: 'Get tasks grouped by priority' })
  getTasksByPriority(@CurrentUser() user: any) {
    return this.analyticsService.getTasksByPriority(user.userId);
  }

  @Get('project-stats')
  @ApiOperation({ summary: 'Get project statistics' })
  getProjectStats(@CurrentUser() user: any) {
    return this.analyticsService.getProjectStats(user.userId);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity' })
  getRecentActivity(@CurrentUser() user: any, @Query('limit') limit?: string) {
    return this.analyticsService.getRecentActivity(user.userId, limit ? parseInt(limit) : 10);
  }
}

