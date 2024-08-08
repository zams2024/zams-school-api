import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUppercase,
} from "class-validator";
import { DefaultAnnouncementDto } from "./announcements-base.dto";

export class UpdateAnnouncementDto extends DefaultAnnouncementDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key]?.toString();
  })
  updatedByUserId: string;

  @ApiProperty({
    type: String,
    default: "UPDATE"
  })
  @IsNotEmpty()
  @IsIn(["UPDATE", "SEND"])
  @IsUppercase()
  actions: "UPDATE" | "SEND" = "UPDATE";
}
