import { Transform, Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Length,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { BaseFilter, InputData, ListChunk } from '../Base';
import { OrganizationBase } from '../Organization';
import { Tag } from '../Tag';

@Entity()
export class Activity extends OrganizationBase {
    @Length(3)
    @Column()
    title: string;

    @IsString()
    @IsOptional()
    @Column({ nullable: true })
    slug?: string;

    @IsDateString()
    @Column('date')
    startTime: string;

    @IsDateString()
    @Column('date')
    endTime: string;

    @Length(3)
    @IsOptional()
    @Column({ nullable: true })
    address?: string;

    @IsUrl()
    @IsOptional()
    @Column({ nullable: true })
    liveLink?: string;

    @IsUrl()
    @IsOptional()
    @Column({ nullable: true })
    banner?: string;

    @Type(() => Tag)
    @Transform(({ value }) => (Array.isArray(value) ? value.map(user => Tag.from(user)) : value))
    @ValidateNested({ each: true })
    @IsOptional()
    @ManyToMany(() => Tag)
    @JoinTable()
    tags?: Tag[];

    @IsString()
    @Column()
    description: string;

    @Type(() => Tag)
    @Transform(({ value }) => (Array.isArray(value) ? value.map(user => Tag.from(user)) : value))
    @ValidateNested({ each: true })
    @IsOptional()
    @ManyToMany(() => Tag)
    @JoinTable()
    cooperationLevels?: Tag[];
}

export abstract class ActivityBase extends OrganizationBase {
    @Type(() => Activity)
    @Transform(({ value }) => Activity.from(value))
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => Activity)
    activity: Activity;
}

export class ActivityBaseFilter extends BaseFilter implements Partial<InputData<ActivityBase>> {
    @IsInt()
    @Min(1)
    @IsOptional()
    activity?: number;
}

export class ActivityListChunk implements ListChunk<Activity> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Activity)
    @ValidateNested({ each: true })
    list: Activity[];
}
