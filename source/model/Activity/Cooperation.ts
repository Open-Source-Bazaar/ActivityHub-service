import { Transform, Type } from 'class-transformer';
import { IsInt, IsPositive, Length, Min, ValidateNested } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { ListChunk } from '../Base';
import { User } from '../User';
import { ActivityBase } from './Activity';

@Entity()
export class Cooperation extends ActivityBase {
    @IsPositive()
    @Column('int')
    level: number;

    @Length(3)
    @Column()
    title: string;

    @Type(() => User)
    @Transform(({ value }) => User.from(value))
    @ValidateNested()
    @ManyToOne(() => User)
    contact: User;
}

export class CooperationListChunk implements ListChunk<Cooperation> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Cooperation)
    @ValidateNested({ each: true })
    list: Cooperation[];
}
