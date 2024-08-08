import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumberString } from "class-validator";
import { DefaultLinkStudentRequestDto } from "./link-student-request-base.dto";

export class UpdateLinkStudentRequestDto extends DefaultLinkStudentRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString();
  })
  updatedByUserId: string;
}

export class UpdateLinkStudentRequestStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString();
  })
  updatedByUserId: string;
}
