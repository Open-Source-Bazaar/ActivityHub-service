import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { InputData, ListChunk } from '../Base';
import { User } from '../User';
import { ActivityBaseFilter } from './Activity';
import { ForumBase } from './Forum';

@Entity()
export class Agenda extends ForumBase {
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

export abstract class AgendaBase extends ForumBase {
    @Type(() => Agenda)
    @Transform(({ value }) => Agenda.from(value))
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => Agenda)
    agenda: Agenda;
}

export class AgendaBaseFilter extends ActivityBaseFilter implements Partial<InputData<AgendaBase>> {
    @IsInt()
    @Min(1)
    @IsOptional()
    agenda?: number;
}

export class AgendaListChunk implements ListChunk<Agenda> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Agenda)
    @ValidateNested({ each: true })
    list: Agenda[];
}
