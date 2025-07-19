import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    ForbiddenError,
    Get,
    HttpCode,
    JsonController,
    OnNull,
    OnUndefined,
    Param,
    Post,
    Put,
    QueryParam,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    BaseFilter,
    dataSource,
    MemberRole,
    Membership,
    Organization,
    OrganizationListChunk,
    User
} from '../../model';
import { searchConditionOf } from '../../utility';
import { ActivityLogController } from '../User';

const organizationStore = dataSource.getRepository(Organization),
    memberStore = dataSource.getRepository(Membership);

@JsonController('/organization')
export class OrganizationController {
    static async assertAdmin(user: User, id: number) {
        const authorized = await organizationStore.existsBy({ id, members: { user } });

        if (!authorized)
            throw new ForbiddenError(
                `You have no permission to access the organization with ID "${id}".`
            );
    }

    static async addMember({ organization, user, roleType }: Partial<Membership>, createdBy: User) {
        await OrganizationController.assertAdmin(createdBy, organization.id);

        const member = await memberStore.save({ organization, user, roleType, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Membership', member.id);

        return member;
    }

    createMember(user: User, role = MemberRole.Admin) {
        const member = new Membership();
        member.user = user;
        member.roleType = role;

        return member;
    }

    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Organization)
    async create(@CurrentUser() createdBy: User, @Body() body: Organization) {
        const organization = await organizationStore.save({
            ...body,
            createdBy,
            members: [this.createMember(createdBy)]
        });
        await ActivityLogController.logCreate(createdBy, 'Organization', organization.id);

        return organization;
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(Organization)
    getOne(@Param('id') id: number) {
        return organizationStore.findOneBy({ id });
    }

    @Get()
    @ResponseSchema(OrganizationListChunk)
    async getList(@QueryParams() { keywords, pageSize = 10, pageIndex = 1 }: BaseFilter) {
        const where = searchConditionOf<Organization>(['name', 'englishName', 'summary'], keywords);

        const [list, count] = await organizationStore.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }

    @Put('/:id')
    @Authorized()
    @ResponseSchema(Organization)
    async edit(
        @CurrentUser() updatedBy: User,
        @Param('id') id: number,
        @Body() body: Organization
    ) {
        await OrganizationController.assertAdmin(updatedBy, id);

        const organization = await organizationStore.save({ ...body, id, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'Organization', organization.id);

        return organization;
    }

    @Post('/:id/member')
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Membership)
    addMember(@CurrentUser() createdBy: User, @Param('id') id: number, @Body() body: Membership) {
        return OrganizationController.addMember(
            { ...body, organization: Organization.from<Organization>(id) },
            createdBy
        );
    }

    @Delete('/:id/member/:mid')
    @Authorized()
    @OnUndefined(204)
    async deleteMember(
        @CurrentUser() deletedBy: User,
        @Param('id') id: number,
        @Param('mid') mid: number
    ) {
        await OrganizationController.assertAdmin(deletedBy, id);

        await memberStore.update({ id: mid }, { deletedBy });
        await memberStore.softDelete(mid);

        await ActivityLogController.logDelete(deletedBy, 'Membership', mid);
    }

    @Get('/:id/member')
    @ResponseSchema(Membership, { isArray: true })
    getMemberList(@Param('id') id: number, @QueryParam('roleType') roleType?: MemberRole) {
        return memberStore.find({
            where: { organization: { id }, ...(roleType ? { roleType } : {}) },
            relations: ['user']
        });
    }
}
