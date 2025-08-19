import {
    Authorized,
    Body,
    CurrentUser,
    ForbiddenError,
    Get,
    JsonController,
    OnNull,
    Param,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    BaseFilter,
    dataSource,
    Forum,
    Organization,
    Place,
    PlaceListChunk,
    User
} from '../../model';
import { searchConditionOf } from '../../utility';
import { ActivityLogController } from '../User';

const placeStore = dataSource.getRepository(Place),
    forumStore = dataSource.getRepository(Forum);

@JsonController('/place')
export class PlaceController {
    static async assertAdmin(user: User, id: number) {
        const isPlaceUser = await forumStore.exists({
            where: { place: { id }, activity: { organization: { members: { id: user.id } } } }
        });
        if (!isPlaceUser) throw new ForbiddenError('You never used this place');
    }

    @Post()
    @Authorized()
    @ResponseSchema(Place)
    async create(@CurrentUser() createdBy: User, @Body() body: Place) {
        const place = await placeStore.save({ ...body, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Place', place.id);

        return place;
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(Place)
    getOne(@Param('id') id: number) {
        return placeStore.findOne({ where: { id }, relations: ['organization', 'createdBy'] });
    }

    @Put('/:id')
    @Authorized()
    @ResponseSchema(Place)
    async edit(@CurrentUser() updatedBy: User, @Param('id') id: number, @Body() body: Place) {
        await PlaceController.assertAdmin(updatedBy, id);

        const place = await placeStore.save({ ...body, id, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'Place', place.id);

        return place;
    }

    @Get()
    @ResponseSchema(PlaceListChunk)
    async getList(@QueryParams() { keywords, pageSize = 10, pageIndex = 1 }: BaseFilter) {
        const where = searchConditionOf<Place>(['name', 'address'], keywords);

        const [list, count] = await placeStore.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
