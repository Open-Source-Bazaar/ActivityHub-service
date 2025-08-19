import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Get,
    HttpCode,
    JsonController,
    Param,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { BaseFilter, Cooperation, CooperationListChunk, dataSource, User } from '../../model';
import { ActivityLogController } from '../User';
import { ActivityController } from './Activity';

const cooperationStore = dataSource.getRepository(Cooperation);

@JsonController('/activity/:aid/cooperation')
export class CooperationController {
    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Cooperation)
    async create(
        @CurrentUser() createdBy: User,
        @Param('aid') aid: number,
        @Body() body: Cooperation
    ) {
        const activity = await ActivityController.assertAdmin(aid, createdBy);

        if (!activity.cooperationLevels?.find(({ id }) => id === body.level.id))
            throw new BadRequestError(
                `Cooperation Level with ID "${body.level.id}" isn't included in "${activity.title}" activity`
            );
        if (body.partner.id === activity.organization.id)
            throw new BadRequestError("Can't cooperate with yourself");

        const cooperation = await cooperationStore.save({
            ...body,
            activity,
            organization: activity.organization,
            createdBy
        });
        await ActivityLogController.logCreate(createdBy, 'Cooperation', cooperation.id);

        return cooperation;
    }

    @Get()
    @ResponseSchema(CooperationListChunk)
    async getList(@QueryParams() { pageSize = 10, pageIndex = 1 }: BaseFilter) {
        const [list, count] = await cooperationStore.findAndCount({
            skip: pageSize * (pageIndex - 1),
            take: pageSize,
            relations: ['level', 'partner']
        });
        return { list, count };
    }

    @Put('/:id')
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
