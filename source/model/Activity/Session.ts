import { IsInt, IsPositive, Length, Min } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { UserBase } from '../User';

@Entity()
export class Session extends UserBase {
    @Length(3)
    @Column()
    title: string;

    @Length(100)
    @Column()
    summary: string;

    @IsPositive()
    @Column()
    durationMinute: number;

    @IsInt()
    @Min(0)
    @Column({ type: 'int', nullable: true })
    peopleCapacity?: number;
}
