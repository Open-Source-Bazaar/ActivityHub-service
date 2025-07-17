import { Transform, Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { User } from '../User';
import { OrganizationBase } from './Organization';

export enum MemberRole {
    Admin,
    Worker
}

@Entity()
export class Membership extends OrganizationBase {
    @Type(() => User)
    @Transform(({ value }) => User.from(value))
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => User)
    user: User;

    @IsEnum(MemberRole)
    @Column({ type: 'simple-enum', enum: MemberRole })
    roleType: MemberRole;
}
