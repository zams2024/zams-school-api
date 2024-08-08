import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumberString } from "class-validator";
import { DefaultSchoolDto } from "./schools-base.dto";

export class CreateSchoolDto extends DefaultSchoolDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString();
  })
  registeredByUserId: string;
}
