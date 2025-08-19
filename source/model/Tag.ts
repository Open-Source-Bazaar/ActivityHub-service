import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { ListChunk } from './Base';
import { UserBase, UserBaseFilter, UserInputData } from './User/User';

export enum TagType {
    Tag = 'tag',
    Category = 'category',
    City = 'city',
    Cooperation = 'cooperation'
}

@Entity()
export class Tag extends UserBase {
    @Column()
    @IsString()
    name: string = '';

    @Column({ type: 'simple-enum', enum: TagType })
    @IsEnum(TagType)
    type: TagType = TagType.Tag;
}

export class TagFilter extends UserBaseFilter implements Partial<UserInputData<Tag>> {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(TagType)
    @IsOptional()
    type?: TagType;
}

export class TagListChunk implements ListChunk<Tag> {
    @Type(() => Tag)
    @ValidateNested({ each: true })
    list: Tag[];

    @IsNumber()
    count: number;
}
