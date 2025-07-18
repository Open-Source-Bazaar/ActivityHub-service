import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { ListChunk } from '../Base';
import { User } from '../User';
import { ActivityBase } from './Activity';

@Entity()
export class SessionSubmit extends ActivityBase {
    @Type(() => User)
    @Transform(({ value }) => (Array.isArray(value) ? value.map(user => User.from(user)) : value))
    @ValidateNested()
    @IsOptional()
    @ManyToMany(() => User, { nullable: true })
    @JoinTable()
    mentors?: User[];

    @IsBoolean()
    @Column({ default: false })
    adopted?: boolean;
}

export class SessionSubmitListChunk implements ListChunk<SessionSubmit> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => SessionSubmit)
    @ValidateNested({ each: true })
    list: SessionSubmit[];
}
