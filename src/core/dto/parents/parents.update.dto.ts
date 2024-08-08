import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsNotEmpty,
  IsNumberString,
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
  IsBooleanString,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsUppercase,
  Matches,
} from "class-validator";
import { DefaultParentUserDto } from "./parents-base.dto";

export class UpdateParentUserDto extends DefaultParentUserDto {
}

export class UpdateParentUserProfileDto extends DefaultParentUserDto {
}