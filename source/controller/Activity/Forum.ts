import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    HttpCode,
    JsonController,
    NotFoundError,
    OnNull,
    Param,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { BaseFilter, dataSource, Forum, ForumListChunk, User } from '../../model';
import { searchConditionOf } from '../../utility';
import { ActivityLogController } from '../User';
import { ActivityController } from './Activity';

const forumStore = dataSource.getRepository(Forum);

@JsonController('/activity/:aid/forum')
export class ForumController {
    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Forum)
    async createOne(
        @CurrentUser() createdBy: User,
        @Param('aid') aid: number,
        @Body() forum: Forum
    ) {
        const activity = await ActivityController.assertAdmin(aid, createdBy);

        const created = await forumStore.save({ ...forum, activity, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Forum', created.id);

        return created;
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(Forum)
    getOne(@Param('id') id: number) {
        return forumStore.findOne({ where: { id }, relations: ['activity', 'producers', 'place'] });
    }

    @Put('/:id')
    @Authorized()
    @ResponseSchema(Forum)
    async updateOne(
        @CurrentUser() updatedBy: User,
        @Param('aid') aid: number,
        @Param('id') id: number,
        @Body() forum: Forum
    ) {
        const existing = await forumStore.findOne({ where: { id }, relations: ['activity'] });

        if (!existing || existing.activity.id !== aid) throw new NotFoundError();

        await ActivityController.assertAdmin(aid, updatedBy);

        const updated = await forumStore.save({ ...existing, ...forum, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'Forum', updated.id);

        return updated;
    }

    @Get()
    @ResponseSchema(ForumListChunk)
    async getList(@QueryParams() { keywords, pageSize = 10, pageIndex = 1 }: BaseFilter) {
        const where = searchConditionOf<Forum>(['title', 'summary'], keywords);
        const [list, count] = await forumStore.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
