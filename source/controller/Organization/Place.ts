import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    JsonController,
    OnNull,
    Param,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { BaseFilter, dataSource, Organization, Place, PlaceListChunk, User } from '../../model';
import { searchConditionOf } from '../../utility';
import { ActivityLogController } from '../ActivityLog';
import { OrganizationController } from './Organization';

const placeStore = dataSource.getRepository(Place);

@JsonController('/organization')
export class PlaceController {
    @Post('/:oid/place')
    @Authorized()
    @ResponseSchema(Place)
    async create(@CurrentUser() createdBy: User, @Param('oid') oid: number, @Body() body: Place) {
        await OrganizationController.assertAdmin(createdBy, oid);

        const place = await placeStore.save({ ...body, organization: { id: oid }, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Place', place.id);

        return place;
    }

    @Get('/:oid/place/:id')
    @OnNull(404)
    @ResponseSchema(Place)
    getOne(@Param('id') id: number) {
        return placeStore.findOneBy({ id });
    }

    @Put('/:oid/place/:id')
    @Authorized()
    @ResponseSchema(Place)
    async edit(
        @CurrentUser() updatedBy: User,
        @Param('oid') oid: number,
        @Param('id') id: number,
        @Body() body: Place
    ) {
        await OrganizationController.assertAdmin(updatedBy, oid);

        const place = await placeStore.save({ ...body, id, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'Place', place.id);

        return place;
    }

    @Get('/:oid/place')
    @ResponseSchema(PlaceListChunk)
    async getList(
        @Param('oid') oid: number,
        @QueryParams() { keywords, pageSize = 10, pageIndex = 1 }: BaseFilter
    ) {
        const where = searchConditionOf<Place>(['name', 'address'], keywords, {
            organization: { id: oid }
        });
        const [list, count] = await placeStore.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
