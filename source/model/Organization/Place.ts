import { IsEnum, Length, IsPositive, IsString, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { ListChunk } from '../Base';
import { OrganizationBase } from './Organization';

export enum PlaceType {
    Room,
    Hall,
    Cafe,
    Restaurant
}

export enum DeviceType {
    Network,
    Projector,
    LED,
    Microphone
}

@Entity()
export class Place extends OrganizationBase {
    @IsEnum(PlaceType)
    @Column({ type: 'simple-enum', enum: PlaceType })
    type: PlaceType;

    @Length(3)
    @Column()
    name: string;

    @Length(10)
    @Column({ nullable: true })
    address?: string;

    @IsPositive()
    @Column('int')
    size: number;

    @IsEnum(DeviceType, { each: true })
    @Column('simple-json')
    devices: DeviceType[];

    @IsInt({ each: true })
    @Column('simple-json')
    openWeekDays: number[];

    @IsString()
    @Column()
    openTime: string;

    @IsString()
    @Column()
    closeTime: string;
}

export class PlaceListChunk implements ListChunk<Place> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Place)
    @ValidateNested({ each: true })
    list: Place[];
}
