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


export class StudentRecipientDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString();
  })
  sectionId: string;

  @ApiProperty({
    isArray: true,
    type: String
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  excludedStudentIds: string[] = [];
}

export class EmployeeRecipientDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString();
  })
  employeeTitleId: string;

  @ApiProperty({
    isArray: true,
    type: String
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  excludedEmployeeIds: string[] = [];
}


export class DefaultAnnouncementDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  targetDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString().toUpperCase();
  })
  @Matches(/\b((1[0-2]|0?[1-9]):([0-5][0-9]) ([AaPp][Mm]))/g, {
    message: "Invalid time format",
  })
  targetTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ obj, key }) => {
    return obj[key].toString();
  })
  @IsBooleanString()
  isSchedule: boolean;

  @ApiProperty({
    isArray: true,
    type: StudentRecipientDto,
  })
  @IsOptional()
  @IsArray()
  @Type(() => StudentRecipientDto)
  @ValidateNested()
  basicEdStudentRecipients: StudentRecipientDto[];

  @ApiProperty({
    isArray: true,
    type: StudentRecipientDto,
  })
  @IsOptional()
  @IsArray()
  @Type(() => StudentRecipientDto)
  @ValidateNested()
  higherEdStudenttudentRecipients: StudentRecipientDto[];

  @ApiProperty({
    isArray: true,
    type: EmployeeRecipientDto,
  })
  @IsOptional()
  @IsArray()
  @Type(() => EmployeeRecipientDto)
  @ValidateNested()
  employeeRecipients: EmployeeRecipientDto[];
}