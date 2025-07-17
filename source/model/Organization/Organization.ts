import { Length, Matches, IsUrl, IsInt, Min, ValidateNested, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { ListChunk } from '../Base';
import { UserBase } from '../User';
import { Membership } from './Membership';

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
    @IsOptional()
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
