import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUppercase,
} from "class-validator";
import { DefaultDepartmentDto } from "./departments-base.dto";

export class CreateDepartmentDto extends DefaultDepartmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString();
  })
  createdByUserId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString();
  })
  schoolId: string;

  @ApiProperty()
  @IsOptional()
  @IsIn(["STUDENT", "EMPLOYEE"])
  @IsUppercase()
  type: "STUDENT" | "EMPLOYEE";
}

export class BatchCreateDepartmentDto extends DefaultDepartmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString();
  })
  createdByUserId: string;

  @ApiProperty()
  @IsNotEmpty()
  orgSchoolCode: string;

  @ApiProperty()
  @IsNotEmpty()
  refId: string;
}
