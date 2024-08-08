import { Announcements } from "./../entities/Announcements";
import { StudentStrand } from "./../entities/StudentStrand";
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, Inject } from "@nestjs/common";
import { Courses } from "../entities/Courses";
import { Departments } from "../entities/Departments";
import { Employees } from "../entities/Employees";
import { EmployeeTitles } from "../entities/EmployeeTitles";
import { Machines } from "../entities/Machines";
import { Notifications } from "../entities/Notifications";
import { Operators } from "../entities/Operators";
import { Parents } from "../entities/Parents";
import { ParentStudent } from "../entities/ParentStudent";
import { Schools } from "../entities/Schools";
import { SchoolYearLevels } from "../entities/SchoolYearLevels";
import { Sections } from "../entities/Sections";
import { StudentCourse } from "../entities/StudentCourse";
import { Students } from "../entities/Students";
import { TapLogs } from "../entities/TapLogs";
import { UserFirebaseToken } from "../entities/UserFirebaseToken";
import { Users } from "../entities/Users";
import { StudentSection } from "../entities/StudentSection";
import { SchoolRequestAccess } from "../entities/SchoolRequestAccess";
import { EmployeeUser } from "../entities/EmployeeUser";
import { LinkStudentRequest } from "../entities/LinkStudentRequest";
import { Strands } from "../entities/Strands";
import { UserProfilePic } from "../entities/UserProfilePic";
import { Files } from "../entities/Files";
import { UserOneSignalSubscription } from "../entities/UserOneSignalSubscription";
import { EmployeeUserAccess } from "../entities/EmployeeUserAccess";
import { AnnouncementRecipient } from "../entities/AnnouncementRecipient";
import { AppRelease } from "../entities/AppRelease";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    const ssl = this.config.get<string>("SSL");
    const config: TypeOrmModuleOptions = {
      type: "postgres",
      host: this.config.get<string>("DATABASE_HOST"),
      port: Number(this.config.get<number>("DATABASE_PORT")),
      database: this.config.get<string>("DATABASE_NAME"),
      username: this.config.get<string>("DATABASE_USER"),
      password: this.config.get<string>("DATABASE_PASSWORD"),
      entities: [
        Courses,
        Departments,
        EmployeeUserAccess,
        Employees,
        EmployeeTitles,
        Machines,
        Notifications,
        Operators,
        Parents,
        ParentStudent,
        Schools,
        SchoolYearLevels,
        Sections,
        StudentCourse,
        Students,
        TapLogs,
        UserFirebaseToken,
        Users,
        StudentSection,
        SchoolRequestAccess,
        LinkStudentRequest,
        EmployeeUser,
        Strands,
        StudentStrand,
        Files,
        UserProfilePic,
        UserOneSignalSubscription,
        Announcements,
        AnnouncementRecipient,
        AppRelease
      ],
      synchronize: false, // never use TRUE in production!
      ssl: ssl.toLocaleLowerCase().includes("true"),
      extra: {},
    };
    if (config.ssl) {
      config.extra.ssl = {
        require: true,
        rejectUnauthorized: false,
      };
    }
    return config;
  }
}
