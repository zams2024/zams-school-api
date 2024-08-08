import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumberString, IsUppercase } from "class-validator";
import { DefaultAnnouncementDto } from "./announcements-base.dto";

export class CreateAnnouncementDto extends DefaultAnnouncementDto {
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

  @ApiProperty({
    type: String,
    default: "UPDATE"
  })
  @IsNotEmpty()
  @IsIn(["DRAFT", "SEND"])
  @IsUppercase()
  actions: "DRAFT" | "SEND" = "DRAFT";
}
