import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    Get,
    HttpCode,
    JsonController,
    OnNull,
    OnUndefined,
    Param,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { dataSource, Tag, TagFilter, TagListChunk, User } from '../model';
import { searchConditionOf } from '../utility';
import { ActivityLogController } from './User/ActivityLog';

const store = dataSource.getRepository(Tag);

@JsonController('/tag')
export class TagController {
    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Tag)
    async createOne(@CurrentUser() createdBy: User, @Body() data: Tag) {
        const saved = await store.save({ ...data, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Tag', saved.id);

        return saved;
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(Tag)
    getOne(@Param('id') id: number) {
        return store.findOne({ where: { id }, relations: ['createdBy'] });
    }

    @Delete('/:id')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(@Param('id') id: number) {
        await store.delete(id);
    }

    @Get()
    @ResponseSchema(TagListChunk)
    async getList(@QueryParams() { name, type, keywords, pageSize, pageIndex }: TagFilter) {
        const where = searchConditionOf<Tag>(['name'], name || keywords, type && { type });
        const [list, count] = await store.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
