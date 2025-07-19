import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    HttpCode,
    JsonController,
    Param,
    Patch,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { BaseFilter, Cooperation, CooperationListChunk, dataSource, User } from '../../model';
import { searchConditionOf } from '../../utility';
import { ActivityLogController } from '../User';
import { ActivityController } from './Activity';

const cooperationStore = dataSource.getRepository(Cooperation);

@JsonController('/activity')
export class CooperationController {
    @Post('/:aid/cooperation')
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Cooperation)
    async create(
        @CurrentUser() createdBy: User,
        @Param('aid') aid: number,
        @Body() body: Cooperation
    ) {
        const activity = await ActivityController.assertAdmin(aid, createdBy);

        const cooperation = await cooperationStore.save({ ...body, activity, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Cooperation', cooperation.id);

        return cooperation;
    }

    @Get('/:aid/cooperation')
    @ResponseSchema(CooperationListChunk)
    async getList(@QueryParams() { keywords, pageSize = 10, pageIndex = 1 }: BaseFilter) {
        const where = searchConditionOf<Cooperation>(['title'], keywords);

        const [list, count] = await cooperationStore.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }

    @Patch(':aid/cooperation/:id')
    @Authorized()
    @ResponseSchema(Cooperation)
    async edit(
        @CurrentUser() updatedBy: User,
        @Param('aid') aid: number,
        @Param('id') id: number,
        @Body() body: Cooperation
    ) {
        await ActivityController.assertAdmin(aid, updatedBy);

        const cooperation = await cooperationStore.save({ ...body, id, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'Cooperation', cooperation.id);

        return cooperation;
    }
}
