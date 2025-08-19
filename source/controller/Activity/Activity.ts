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
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { Activity, ActivityListChunk, BaseFilter, dataSource, MemberRole, User } from '../../model';
import { searchConditionOf } from '../../utility';
import { OrganizationController } from '../Organization';
import { ActivityLogController } from '../User';

const activityStore = dataSource.getRepository(Activity);

@JsonController('/activity')
export class ActivityController {
    static async assertAdmin(id: number, user: User) {
        const activity =
            (await activityStore.findOneBy({ id, createdBy: user })) ||
            (await activityStore.findOneBy({
                id,
                organization: { members: { user, roleType: MemberRole.Admin } }
            }));
        if (activity) return activity;

        throw new ForbiddenError();
    }

    static setAdminACL({ organization }: Activity, user: User, createdBy: User) {
        return OrganizationController.addMember(
            { organization, user, roleType: MemberRole.Admin },
            createdBy
        );
    }

    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Activity)
    async create(
        @CurrentUser() createdBy: User,
        @Body() { organization, ...rest }: Activity
    ): Promise<Activity> {
        await OrganizationController.assertAdmin(createdBy, organization.id);

        const activity = await activityStore.save({ ...rest, organization, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Activity', activity.id);

        return activity;
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(Activity)
    getOne(@Param('id') id: number) {
        return activityStore.findOneBy({ id });
    }

    @Put('/:id')
    @Authorized()
    @ResponseSchema(Activity)
    async edit(@CurrentUser() updatedBy: User, @Param('id') id: number, @Body() body: Activity) {
        await ActivityController.assertAdmin(id, updatedBy);

        const activity = await activityStore.save({ ...body, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'Activity', activity.id);

        return activity;
    }

    @Get()
    @ResponseSchema(ActivityListChunk)
    async getList(@QueryParams() { keywords, pageSize = 10, pageIndex = 1 }: BaseFilter) {
        const where = searchConditionOf<Activity>(
            ['title', 'slug', 'address', 'description'],
            keywords
        );
        const [list, count] = await activityStore.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
