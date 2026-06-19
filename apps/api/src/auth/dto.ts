import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Growth Demo Angola" })
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @ApiPropertyOptional({ example: "5417000000" })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiProperty({ example: "Administrador Growth" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "admin@growtherp.ao" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: "admin@growtherp.ao" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
