import { Transform, Type } from 'class-transformer';
import { IsInt, Min, ValidateNested } from 'class-validator';
import { Entity, ManyToOne } from 'typeorm';

import { ListChunk } from '../Base';
import { Organization } from '../Organization';
import { Tag } from '../Tag';
import { ActivityBase } from './Activity';

@Entity()
export class Cooperation extends ActivityBase {
    @Type(() => Tag)
    @Transform(({ value }) => Tag.from(value))
    @ValidateNested()
    @ManyToOne(() => Tag)
    level: Tag;

    @Type(() => Organization)
    @Transform(({ value }) => Organization.from(value))
    @ValidateNested()
    @ManyToOne(() => Organization)
    partner: Organization;
}

export class CooperationListChunk implements ListChunk<Cooperation> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Cooperation)
    @ValidateNested({ each: true })
    list: Cooperation[];
}
