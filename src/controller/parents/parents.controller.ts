import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  DELETE_SUCCESS,
  SAVING_SUCCESS,
  UPDATE_SUCCESS,
} from "src/common/constant/api-response.constant";
import { CreateParentUserDto } from "src/core/dto/parents/parents.create.dto";
import {
  UpdateParentUserDto,
  UpdateParentUserProfileDto,
} from "src/core/dto/parents/parents.update.dto";
import { PaginationParamsDto } from "src/core/dto/pagination-params.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Parents } from "src/db/entities/Parents";
import { ParentsService } from "src/services/parents.service";
import { UpdateUserResetPasswordDto } from "src/core/dto/auth/reset-password.dto";
import { UpdateProfilePictureDto } from "src/core/dto/auth/reset-password.dto copy";

@ApiTags("parents")
@Controller("parents")
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get("/:parentCode")
  //   @UseGuards(JwtAuthGuard)
  async getDetails(@Param("parentCode") parentCode: string) {
    const res = {} as ApiResponseModel<Parents>;
    try {
      res.data = await this.parentsService.getByCode(parentCode);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get("getParentStudents/:parentCode")
  //   @UseGuards(JwtAuthGuard)
  async getParentStudents(@Param("parentCode") parentCode: string) {
    const res = {} as any;
    try {
      res.data = await this.parentsService.getParentStudents(parentCode);
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
    const res: ApiResponseModel<{ results: Parents[]; total: number }> =
      {} as any;
    try {
      res.data = await this.parentsService.getPagination(params);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("updateProfile/:parentCode")
  //   @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Param("parentCode") parentCode: string,
    @Body() dto: UpdateParentUserProfileDto
  ) {
    const res: ApiResponseModel<Parents> = {} as any;
    try {
      res.data = await this.parentsService.updateProfile(parentCode, dto);
      res.success = true;
      res.message = `Parent ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("approveAccessRequest/:parentCode")
  //   @UseGuards(JwtAuthGuard)
  async approveAccessRequest(@Param("parentCode") parentCode: string) {
    const res: ApiResponseModel<Parents> = {} as any;
    try {
      res.data = await this.parentsService.approveAccessRequest(parentCode);
      res.success = true;
      res.message = `Parent ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Delete("/:parentCode")
  //   @UseGuards(JwtAuthGuard)
  async delete(@Param("parentCode") parentCode: string) {
    const res: ApiResponseModel<Parents> = {} as any;
    try {
      res.data = await this.parentsService.delete(parentCode);
      res.success = true;
      res.message = `Parent ${DELETE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("resetPassword/:parentCode")
  //   @UseGuards(JwtAuthGuard)
  async resetPassword(
    @Param("parentCode") parentCode: string,
    @Body() updateUserResetPasswordDto: UpdateUserResetPasswordDto
  ) {
    const res: ApiResponseModel<Parents> = {} as any;
    try {
      res.data = await this.parentsService.resetPassword(
        parentCode,
        updateUserResetPasswordDto
      );
      res.success = true;
      res.message = `Parent password ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/updateProfilePicture/:parentCode")
  async updateProfilePicture(
    @Param("parentCode") parentCode: string,
    @Body() dto: UpdateProfilePictureDto
  ) {
    const res: ApiResponseModel<Parents> = {} as any;
    try {
      res.data = await this.parentsService.updateProfilePicture(
        parentCode,
        dto
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
