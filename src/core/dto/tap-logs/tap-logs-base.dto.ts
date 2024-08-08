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
  Matches,
  ValidateNested,
} from "class-validator";

export class DefaultTapLogDto {
  @ApiProperty()
  @IsNotEmpty()
  orgSchoolCode: string;

  @ApiProperty()
  @IsNotEmpty()
  sender: string;

  @ApiProperty()
  @IsOptional()
  @IsIn(["LOG IN", "LOG OUT"])
  @IsUppercase()
  status: "LOG IN" | "LOG OUT";

  @ApiProperty()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsIn(["STUDENT", "EMPLOYEE"])
  @IsUppercase()
  userType: "STUDENT" | "EMPLOYEE";

  @ApiProperty()
  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString().toUpperCase();
  })
  @Matches(/\b((1[0-2]|0?[1-9]):([0-5][0-9]) ([AaPp][Mm]))/g, {
    message: "Invalid time format",
  })
  time: string;
}
