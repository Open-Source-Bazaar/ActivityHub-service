import {
    Authorized,
    Body,
    CurrentUser,
    ForbiddenError,
    Get,
    HttpCode,
    JsonController,
    OnNull,
    Param,
    Post,
    Put
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { dataSource, Session, User } from '../../model';
import { ActivityLogController } from '../User';

const sessionStore = dataSource.getRepository(Session);

@JsonController('/activity/session')
export class ActivitySessionController {
    static async assertOwner(id: number, createdBy: User) {
        const session = await sessionStore.findOneBy({ id, createdBy });

        if (session) return session;

        throw new ForbiddenError();
    }

    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Session)
    async create(@CurrentUser() createdBy: User, @Body() body: Session) {
        const session = await sessionStore.save({ ...body, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Session', session.id);

        return session;
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(Session)
    getOne(@Param('id') id: number) {
        return sessionStore.findOneBy({ id });
    }

    @Put('/:id')
    @Authorized()
    @ResponseSchema(Session)
    async edit(@CurrentUser() updatedBy: User, @Param('id') id: number, @Body() body: Session) {
        await ActivitySessionController.assertOwner(id, updatedBy);

        const session = await sessionStore.save({ ...body, id, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'Session', session.id);

        return session;
    }
}
