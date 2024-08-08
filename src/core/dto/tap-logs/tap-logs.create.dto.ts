import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumberString } from "class-validator";
import { DefaultTapLogDto } from "./tap-logs-base.dto";

export class CreateTapLogDto extends DefaultTapLogDto {
  @ApiProperty()
  @IsNotEmpty()
  refId: string;
}
