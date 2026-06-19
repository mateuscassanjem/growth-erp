import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateCurrentCompanyDto {
  @ApiPropertyOptional({ example: "Growth Demo Angola" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "5417000000" })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiPropertyOptional({ example: "geral@growtherp.ao" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "+244 923 000 000" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "Luanda, Angola" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: "https://example.com/logo.png" })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
