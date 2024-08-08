import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import {
  DELETE_SUCCESS,
  SAVING_SUCCESS,
  UPDATE_SUCCESS,
} from "src/common/constant/api-response.constant";
import { CreateAnnouncementDto } from "src/core/dto/announcements/announcements.create.dto";
import { UpdateAnnouncementDto } from "src/core/dto/announcements/announcements.update.dto";
import { PaginationParamsDto } from "src/core/dto/pagination-params.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Announcements } from "src/db/entities/Announcements";
import { AnnouncementsService } from "src/services/announcements.service";

@ApiTags("announcements")
@Controller("announcements")
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get("/:announcementCode")
  //   @UseGuards(JwtAuthGuard)
  async getDetails(@Param("announcementCode") announcementCode: string) {
    const res = {} as ApiResponseModel<Announcements>;
    try {
      res.data = await this.announcementsService.getByCode(announcementCode);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("/page")
  //   @UseGuards(JwtAuthGuard)
  async getPaginated(@Body() params: PaginationParamsDto) {
    const res: ApiResponseModel<{ results: Announcements[]; total: number }> =
      {} as any;
    try {
      res.data = await this.announcementsService.getAnnouncementsPagination(
        params
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("")
  //   @UseGuards(JwtAuthGuard)
  async create(@Body() announcementsDto: CreateAnnouncementDto) {
    const res: ApiResponseModel<Announcements> = {} as any;
    try {
      res.data = await this.announcementsService.create(announcementsDto);
      res.success = true;
      res.message = `Announcements ${SAVING_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/:announcementCode")
  //   @UseGuards(JwtAuthGuard)
  async update(
    @Param("announcementCode") announcementCode: string,
    @Body() dto: UpdateAnnouncementDto
  ) {
    const res: ApiResponseModel<Announcements> = {} as any;
    try {
      res.data = await this.announcementsService.update(announcementCode, dto);
      res.success = true;
      res.message = `Announcements ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("cancel/:announcementCode")
  //   @UseGuards(JwtAuthGuard)
  async cancel(@Param("announcementCode") announcementCode: string) {
    const res: ApiResponseModel<Announcements> = {} as any;
    try {
      res.data = await this.announcementsService.cancel(announcementCode);
      res.success = true;
      res.message = `Announcements Cancelled!`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Delete("/:announcementCode")
  //   @UseGuards(JwtAuthGuard)
  async delete(@Param("announcementCode") announcementCode: string) {
    const res: ApiResponseModel<Announcements> = {} as any;
    try {
      res.data = await this.announcementsService.delete(announcementCode);
      res.success = true;
      res.message = `Announcements ${DELETE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
