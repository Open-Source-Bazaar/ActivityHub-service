import { Transform, Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsUrl,
    Length,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseFilter, InputData, ListChunk } from '../Base';
import { OrganizationBase } from '../Organization';

@Entity()
export class Activity extends OrganizationBase {
    @Length(3)
    @Column()
    title: string;

    @IsDateString()
    @Column('datetime')
    startTime: string;

    @IsDateString()
    @Column('datetime')
    endTime: string;

    @Length(3)
    @Column({ nullable: true })
    address?: string;

    @IsUrl()
    @Column({ nullable: true })
    url?: string;

    @IsUrl()
    @Column({ nullable: true })
    banner?: string;
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
