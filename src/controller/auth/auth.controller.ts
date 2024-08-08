/* eslint-disable prettier/prettier */
import { LocalAuthGuard } from "../../core/auth/local.auth.guard";
import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  UseGuards,
  Param,
  Headers,
  Query,
} from "@nestjs/common";
import { AuthService } from "../../services/auth.service";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { LogInDto, LogInOrgDto } from "src/core/dto/auth/login.dto";
import { ApiParam, ApiTags } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import { REGISTER_SUCCESS } from "src/common/constant/api-response.constant";
import { RegisterStudentUserDto } from "src/core/dto/auth/register-student.dto";
import { Users } from "src/db/entities/Users";
import { Students } from "src/db/entities/Students";
import { Employees } from "src/db/entities/Employees";
import { Operators } from "src/db/entities/Operators";
import { RegisterEmployeeUserDto } from "src/core/dto/auth/register-employee.dto";
import { RegisterOperatorUserDto } from "src/core/dto/auth/register-operator.dto";
import { RegisterParentUserDto } from "src/core/dto/auth/register-parent.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // //   @UseGuards(JwtAuthGuard)
  // @Post("register/student")
  // public async registerStudent(
  //   @Body()
  //   dto: RegisterStudentUserDto
  // ) {
  //   const res: ApiResponseModel<any> = {} as any;
  //   try {
  //     res.data = await this.authService.registerStudent(
  //       dto as RegisterStudentUserDto
  //     );
  //     res.success = true;
  //     res.message = `${REGISTER_SUCCESS}`;
  //     return res;
  //   } catch (e) {
  //     res.success = false;
  //     res.message = e.message !== undefined ? e.message : e;
  //     return res;
  //   }
  // }
  @Post("register/employeeUser")
  public async registerEmployee(
    @Body()
    dto: RegisterEmployeeUserDto
  ) {
    const res: ApiResponseModel<any> = {} as any;
    try {
      res.data = await this.authService.registerEmployee(
        dto as RegisterEmployeeUserDto
      );
      res.success = true;
      res.message = `${REGISTER_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("register/parent")
  public async registerParent(
    @Body()
    dto: RegisterParentUserDto
  ) {
    const res: ApiResponseModel<any> = {} as any;
    try {
      res.data = await this.authService.registerParent(
        dto as RegisterParentUserDto
      );
      res.success = true;
      res.message = `${REGISTER_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("login/operator")
  public async loginOperator(@Body() loginUserDto: LogInDto) {
    const res: ApiResponseModel<any> = {} as ApiResponseModel<any>;
    try {
      res.data = await this.authService.getOperatorsByCredentials(loginUserDto.userName, loginUserDto.password);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("login/employeeUser")
  public async loginEmployeeUser(@Body() loginUserDto: LogInOrgDto) {
    const res: ApiResponseModel<any> = {} as ApiResponseModel<any>;
    try {
      res.data = await this.authService.getEmployeeUserByCredentials(loginUserDto);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("login/parent")
  public async loginParent(@Body() loginUserDto: LogInDto) {
    const res: ApiResponseModel<any> = {} as ApiResponseModel<any>;
    try {
      res.data = await this.authService.getParentsByCredentials(loginUserDto.userName, loginUserDto.password);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
