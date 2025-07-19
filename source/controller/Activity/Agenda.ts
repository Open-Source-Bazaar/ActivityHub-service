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

import { Agenda, AgendaListChunk, BaseFilter, dataSource, User } from '../../model';
import { ActivityLogController } from '../User';
import { ActivityController } from './Activity';
import { ActivitySessionController } from './Session';

const agendaStore = dataSource.getRepository(Agenda);

@JsonController('/activity')
export class AgendaController {
    @Post('/session/:sid/submit')
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Agenda)
    async create(
        @CurrentUser() createdBy: User,
        @Param('sid') sid: number,
        @Body() { activity, mentors = [] }: Agenda
    ) {
        const session = await ActivitySessionController.assertOwner(sid, createdBy);

        const submit = await agendaStore.save({
            session,
            activity,
            mentors: [createdBy, ...mentors],
            adopted: false
        });
        await ActivityLogController.logCreate(createdBy, 'Agenda', submit.id);

        return submit;
    }

    @Get('/session/submit/:id')
    @OnNull(404)
    @ResponseSchema(Agenda)
    getOne(@Param('id') id: number) {
        return agendaStore.findOneBy({ id });
    }

    @Put('/session/submit/:id')
    @Authorized()
    @ResponseSchema(Agenda)
    async edit(
        @CurrentUser() updatedBy: User,
        @Param('id') id: number,
        @Body() { activity, mentors = [] }: Agenda
    ) {
        await ActivitySessionController.assertOwner(id, updatedBy);

        const submit = await agendaStore.save({
            id,
            updatedBy,
            activity,
            mentors: [updatedBy, ...mentors]
        });
        await ActivityLogController.logUpdate(updatedBy, 'Agenda', submit.id);

        return submit;
    }

    @Get('/:aid/session/submit')
    @ResponseSchema(AgendaListChunk)
    async getList(@QueryParams() { pageSize = 10, pageIndex = 1 }: BaseFilter) {
        const [list, count] = await agendaStore.findAndCount({
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }

    @Put('/:aid/session/submit/:id')
    @Authorized()
    @ResponseSchema(Agenda)
    async adopt(
        @CurrentUser() updatedBy: User,
        @Param('aid') aid: number,
        @Param('id') id: number,
        @Body() { adopted }: Agenda
    ) {
        await ActivityController.assertAdmin(aid, updatedBy);

        const submit = await agendaStore.save({ id, updatedBy, adopted });

        await ActivityLogController.logUpdate(updatedBy, 'Agenda', submit.id);

        return submit;
    }
}
