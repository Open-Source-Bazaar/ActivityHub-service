import { Transform, Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsUrl,
    Length,
    Matches,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { ListChunk } from '../Base';
import { User, UserBase } from '../User';

@Entity()
export class Organization extends UserBase {
    @Length(3)
    @Column({ unique: true })
    name: string;

    @Matches(/^[A-Za-z-]+$/)
    @Column({ unique: true })
    englishName: string;

    @Length(100)
    @Column({ nullable: true })
    summary?: string;

    @IsUrl()
    @Column({ nullable: true })
    logo?: string;

    @IsUrl()
    @Column({ nullable: true })
    url?: string;

    @Type(() => Membership)
    @ValidateNested({ each: true })
    @IsOptional()
    @OneToMany(() => Membership, ({ organization }) => organization, { cascade: true })
    members: Membership[];
}

export abstract class OrganizationBase extends UserBase {
    @Type(() => Organization)
    @Transform(({ value }) => Organization.from(value))
    @ValidateNested()
    @ManyToOne(() => Organization)
    organization: Organization;
}

export class OrganizationListChunk implements ListChunk<Organization> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Organization)
    @ValidateNested({ each: true })
    list: Organization[];
}

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
