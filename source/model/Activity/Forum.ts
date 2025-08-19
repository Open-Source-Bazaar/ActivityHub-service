import { Transform, Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { ListChunk } from '../Base';
import { Place } from '../Organization';
import { User } from '../User';
import { Activity, ActivityBase } from './Activity';

@Entity()
export class Forum extends ActivityBase {
    @IsString()
    @Column()
    title: string;

    @IsString()
    @IsOptional()
    @Column({ nullable: true })
    summary?: string;

    @Type(() => User)
    @Transform(({ value }) => (Array.isArray(value) ? value.map(user => User.from(user)) : []))
    @ValidateNested({ each: true })
    @ManyToMany(() => User)
    @JoinTable()
    producers: User[];

    @IsDateString()
    @Column('date')
    startTime: string;

    @IsDateString()
    @Column('date')
    endTime: string;

    @Type(() => Place)
    @Transform(({ value }) => Place.from(value))
    @ValidateNested()
    @ManyToOne(() => Place)
    place: Place;
}

export abstract class ForumBase extends ActivityBase {
    @Type(() => Forum)
    @Transform(({ value }) => Forum.from(value))
    @ValidateNested()
    @ManyToOne(() => Forum)
    forum: Forum;
}

export class ForumListChunk implements ListChunk<Forum> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Forum)
    @ValidateNested({ each: true })
    list: Forum[];
}
