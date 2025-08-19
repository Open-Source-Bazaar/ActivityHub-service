import { Transform, Type } from 'class-transformer';
import { IsInt, IsLatLong, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Column, Entity, ManyToOne, ViewColumn, ViewEntity } from 'typeorm';

import { ListChunk } from '../Base';
import { User } from '../User';
import { AgendaBase, AgendaBaseFilter } from './Agenda';

@Entity()
export class CheckEvent extends AgendaBase {
    @IsLatLong()
    @IsOptional()
    @Column({ nullable: true })
    coordinate?: string;

    @Type(() => User)
    @Transform(({ value }) => User.from(value))
    @ValidateNested()
    @ManyToOne(() => User)
    user: User;
}

export class CheckEventFilter extends AgendaBaseFilter {
    @IsInt()
    @Min(1)
    @IsOptional()
    user?: number;
}

export class CheckEventChunk implements ListChunk<CheckEvent> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => CheckEvent)
    @ValidateNested({ each: true })
    list: CheckEvent[];
}

@ViewEntity({
    expression: connection =>
        connection
            .createQueryBuilder()
            .from(CheckEvent, 'ce')
            .groupBy('ce.activity.id')
            .addGroupBy('ce.activity.name')
            .select('ce.activity.id', 'activityId')
            .addSelect('ce.activity.name', 'activityName')
            .addSelect('COUNT(ce.id)', 'checkCount')
})
export class ActivityCheckInSummary {
    @ViewColumn()
    @IsInt()
    @Min(1)
    activityId: number;

    @ViewColumn()
    @IsString()
    activityName: string;

    @ViewColumn()
    @IsInt()
    @Min(0)
    checkCount: number;
}

@ViewEntity({
    expression: connection =>
        connection
            .createQueryBuilder()
            .from(CheckEvent, 'ce')
            .groupBy('ce.user.id')
            .addGroupBy('ce.activity.id')
            .addGroupBy('ce.activity.name')
            .select('ce.activity.id', 'activityId')
            .addSelect('ce.user.id', 'userId')
            .addSelect('ce.activity.name', 'activityName')
            .addSelect('COUNT(ce.id)', 'checkCount')
})
export class UserActivityCheckInSummary extends ActivityCheckInSummary {
    @ViewColumn()
    @IsInt()
    @Min(1)
    userId: number;

    @Type(() => User)
    @ValidateNested()
    user: User;
}

@ViewEntity({
    expression: connection =>
        connection
            .createQueryBuilder()
            .from(CheckEvent, 'ce')
            .groupBy('ce.activity.id')
            .addGroupBy('ce.activity.name')
            .addGroupBy('ce.agenda.id')
            .addGroupBy('ce.agenda.title')
            .select('ce.activity.id', 'activityId')
            .addSelect('ce.activity.name', 'activityName')
            .addSelect('ce.agenda.id', 'agendaId')
            .addSelect('ce.agenda.title', 'agendaTitle')
            .addSelect('COUNT(ce.id)', 'checkCount')
})
export class ActivityAgendaCheckInSummary extends ActivityCheckInSummary {
    @ViewColumn()
    @IsInt()
    @Min(1)
    agendaId: number;

    @ViewColumn()
    @IsString()
    agendaTitle: string;
}

export class UserActivityCheckInListChunk implements ListChunk<UserActivityCheckInSummary> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => UserActivityCheckInSummary)
    @ValidateNested({ each: true })
    list: UserActivityCheckInSummary[];
}

export class ActivityCheckInListChunk implements ListChunk<ActivityCheckInSummary> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => ActivityCheckInSummary)
    @ValidateNested({ each: true })
    list: ActivityCheckInSummary[];
}

export class ActivityAgendaCheckInListChunk implements ListChunk<ActivityAgendaCheckInSummary> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => ActivityAgendaCheckInSummary)
    @ValidateNested({ each: true })
    list: ActivityAgendaCheckInSummary[];
}
