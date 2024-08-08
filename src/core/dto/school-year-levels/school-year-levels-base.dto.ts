import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUppercase,
  ValidateNested,
} from "class-validator";

export class DefaultSchoolYearLevelDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsIn(["PRIMARY", "JUNIOR", "SENIOR", "COLLEGE"])
  @IsUppercase()
  educationalStage: "PRIMARY" | "JUNIOR" | "SENIOR" | "COLLEGE";
}