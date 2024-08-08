import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "./db/typeorm/typeorm.service";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./controller/auth/auth.module";
import * as Joi from "@hapi/joi";
import { getEnvPath } from "./common/utils/utils";
import { SchoolsModule } from "./controller/schools/schools.module";
import { DepartmentsModule } from "./controller/departments/departments.module";
import { CoursesModule } from "./controller/courses/courses.module";
import { SchoolYearLevelsModule } from "./controller/school-year-levels/school-year-levels.module";
import { SectionsModule } from "./controller/sections/sections.module";
import { EmployeeTitlesModule } from "./controller/employee-titles/employee-titles.module";
import { StudentsModule } from "./controller/students/students.module";
import { EmployeesModule } from "./controller/employees/employees.module";
import { OperatorsModule } from "./controller/operators/operators.module";
import { ParentsModule } from "./controller/parents/parents.module";
import { LinkStudentRequestModule } from "./controller/link-student-request/link-student-request.module";
import { UserFirebaseTokenModule } from "./controller/user-firebase-token/user-firebase-token.module";
import { TapLogsModule } from "./controller/tap-logs/tap-logs.module";
import { MachinesModule } from "./controller/machines/machines.module";
import { StrandsModule } from "./controller/strands/strands.module";
import { NotificationsModule } from "./controller/notifications/notifications.module";
import { UserOneSignalSubscriptionModule } from "./controller/user-one-signal-subscription/user-one-signal-subscription.module";
import { AnnouncementsModule } from "./controller/announcements/announcements.module";
import { EmployeeUserModule } from "./controller/employee-user/employee-user.module";
import { EmployeeUserAccessModule } from "./controller/employee-user-access/employee-user-access.module";
import { AppReleaseModule } from "./controller/app-release/app-release.module";
const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      validationSchema: Joi.object({
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    AuthModule,
    SchoolsModule,
    EmployeeUserAccessModule,
    EmployeeTitlesModule,
    DepartmentsModule,
    CoursesModule,
    SchoolYearLevelsModule,
    SectionsModule,
    OperatorsModule,
    EmployeesModule,
    EmployeeUserModule,
    StudentsModule,
    ParentsModule,
    LinkStudentRequestModule,
    UserFirebaseTokenModule,
    MachinesModule,
    TapLogsModule,
    StrandsModule,
    NotificationsModule,
    UserOneSignalSubscriptionModule,
    AnnouncementsModule,
    AppReleaseModule,
  ],
  providers: [AppService],
  controllers: [],
})
export class AppModule {}
