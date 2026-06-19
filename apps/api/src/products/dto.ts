import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  sku!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock!: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
