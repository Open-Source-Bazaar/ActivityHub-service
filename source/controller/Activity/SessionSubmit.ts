import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    HttpCode,
    JsonController,
    OnNull,
    Param,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { BaseFilter, dataSource, SessionSubmit, SessionSubmitListChunk, User } from '../../model';
import { ActivityLogController } from '../ActivityLog';
import { ActivityController } from './Activity';
import { ActivitySessionController } from './Session';

const sessionSubmitStore = dataSource.getRepository(SessionSubmit);

@JsonController('/activity')
export class SessionSubmitController {
    @Post('/session/:sid/submit')
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(SessionSubmit)
    async create(
        @CurrentUser() createdBy: User,
        @Param('sid') sid: number,
        @Body() { activity, mentors = [] }: SessionSubmit
    ) {
        const session = await ActivitySessionController.assertOwner(sid, createdBy);

        const submit = await sessionSubmitStore.save({
            session,
            activity,
            mentors: [createdBy, ...mentors],
            adopted: false
        });
        await ActivityLogController.logCreate(createdBy, 'SessionSubmit', submit.id);

        return submit;
    }

    @Get('/session/submit/:id')
    @OnNull(404)
    @ResponseSchema(SessionSubmit)
    getOne(@Param('id') id: number) {
        return sessionSubmitStore.findOneBy({ id });
    }

    @Put('/session/submit/:id')
    @Authorized()
    @ResponseSchema(SessionSubmit)
    async edit(
        @CurrentUser() updatedBy: User,
        @Param('id') id: number,
        @Body() { activity, mentors = [] }: SessionSubmit
    ) {
        await ActivitySessionController.assertOwner(id, updatedBy);

        const submit = await sessionSubmitStore.save({
            id,
            updatedBy,
            activity,
            mentors: [updatedBy, ...mentors]
        });
        await ActivityLogController.logUpdate(updatedBy, 'SessionSubmit', submit.id);

        return submit;
    }

    @Get('/:aid/session/submit')
    @ResponseSchema(SessionSubmitListChunk)
    async getList(@QueryParams() { pageSize = 10, pageIndex = 1 }: BaseFilter) {
        const [list, count] = await sessionSubmitStore.findAndCount({
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }

    @Put('/:aid/session/submit/:id')
    @Authorized()
    @ResponseSchema(SessionSubmit)
    async adopt(
        @CurrentUser() updatedBy: User,
        @Param('aid') aid: number,
        @Param('id') id: number,
        @Body() { adopted }: SessionSubmit
    ) {
        await ActivityController.assertAdmin(aid, updatedBy);

        const submit = await sessionSubmitStore.save({ id, updatedBy, adopted });

        await ActivityLogController.logUpdate(updatedBy, 'SessionSubmit', submit.id);

        return submit;
    }
}
