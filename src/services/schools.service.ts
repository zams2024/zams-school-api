import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SCHOOLS_ERROR_NOT_FOUND } from "src/common/constant/schools.constant";
import { CONST_QUERYCURRENT_TIMESTAMP } from "src/common/constant/timestamp.constant";
import { USER_ERROR_USER_NOT_FOUND } from "src/common/constant/user-error.constant";
import {
  columnDefToTypeORMCondition,
  generateIndentityCode,
} from "src/common/utils/utils";
import { UpdateSchoolDto } from "src/core/dto/schools/schools.update.dto";
import { CreateSchoolDto } from "src/core/dto/schools/schools.create.dto";
import { Schools } from "src/db/entities/Schools";
import { Users } from "src/db/entities/Users";
import { Repository } from "typeorm";

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(Schools)
    private readonly schoolsRepo: Repository<Schools>
  ) {}

  async getSchoolsPagination({ pageSize, pageIndex, order, columnDef }) {
    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);

    const condition = columnDefToTypeORMCondition(columnDef);
    const [results, total] = await Promise.all([
      this.schoolsRepo.find({
        where: {
          ...condition,
          active: true,
        },
        relations: {
          registeredByUser: true,
          updatedByUser: true,
        },
        skip,
        take,
        order,
      }),
      this.schoolsRepo.count({
        where: {
          ...condition,
          active: true,
        },
      }),
    ]);
    return {
      results: results.map((x) => {
        delete x.registeredByUser.password;
        if (x?.updatedByUser?.password) {
          delete x.updatedByUser.password;
        }
        return x;
      }),
      total,
    };
  }

  async getByCode(schoolCode) {
    const result = await this.schoolsRepo.findOne({
      where: {
        schoolCode,
        active: true,
      },
      relations: {
        registeredByUser: true,
        updatedByUser: true,
      },
    });
    if (!result) {
      throw Error(SCHOOLS_ERROR_NOT_FOUND);
    }
    delete result.registeredByUser.password;
    if (result?.updatedByUser?.password) {
      delete result.updatedByUser.password;
    }
    return result;
  }

  async getByOrgCode(orgSchoolCode) {
    const result = await this.schoolsRepo.findOne({
      where: {
        orgSchoolCode,
        active: true,
      },
      relations: {
        registeredByUser: true,
        updatedByUser: true,
      },
    });
    if (!result) {
      throw Error(SCHOOLS_ERROR_NOT_FOUND);
    }
    delete result.registeredByUser.password;
    if (result?.updatedByUser?.password) {
      delete result.updatedByUser.password;
    }
    return result;
  }

  async create(dto: CreateSchoolDto) {
    return await this.schoolsRepo.manager.transaction(async (entityManager) => {
      let schools = new Schools();
      schools.orgSchoolCode = dto.orgSchoolCode;
      schools.schoolName = dto.schoolName;
      schools.schoolAddress = dto.schoolAddress;
      schools.schoolContactNumber = dto.schoolContactNumber;
      schools.schoolEmail = dto.schoolEmail;
      schools.studentsAllowableTimeLate = dto.studentsAllowableTimeLate;
      schools.studentsTimeLate = dto.studentsTimeLate;
      schools.restrictGuardianTime = dto.restrictGuardianTime;
      schools.employeesTimeBeforeSwipeIsAllowed =
        dto.employeesTimeBeforeSwipeIsAllowed;
      schools.employeesAllowableTimeLate = dto.employeesAllowableTimeLate;
      schools.employeesTimeLate = dto.employeesTimeLate;
      schools.timeBeforeSwipeIsAllowed = dto.timeBeforeSwipeIsAllowed;
      schools.smsNotificationForStaffEntry = dto.smsNotificationForStaffEntry;
      schools.smsNotificationForStudentBreakTime =
        dto.smsNotificationForStudentBreakTime;
      const timestamp = await entityManager
        .query(CONST_QUERYCURRENT_TIMESTAMP)
        .then((res) => {
          return res[0]["timestamp"];
        });
      schools.dateRegistered = timestamp;

      const registeredByUser = await entityManager.findOne(Users, {
        where: {
          userId: dto.registeredByUserId,
          active: true,
        },
      });
      if (!registeredByUser) {
        throw Error(USER_ERROR_USER_NOT_FOUND);
      }
      schools.registeredByUser = registeredByUser;
      schools = await entityManager.save(schools);
      schools.schoolCode = generateIndentityCode(schools.schoolId);
      schools = await entityManager.save(Schools, schools);
      delete schools.registeredByUser.password;
      return schools;
    });
  }

  async batchCreate(dtos: CreateSchoolDto[]) {
    return await this.schoolsRepo.manager.transaction(async (entityManager) => {
      const schools = [];
      for (const dto of dtos) {
        let school = new Schools();
        school.orgSchoolCode = dto.orgSchoolCode;
        school.schoolName = dto.schoolName;
        school.schoolAddress = dto.schoolAddress;
        school.schoolContactNumber = dto.schoolContactNumber;
        school.schoolEmail = dto.schoolEmail;
        school.studentsAllowableTimeLate = dto.studentsAllowableTimeLate;
        school.studentsTimeLate = dto.studentsTimeLate;
        school.restrictGuardianTime = dto.restrictGuardianTime;
        school.employeesTimeBeforeSwipeIsAllowed =
          dto.employeesTimeBeforeSwipeIsAllowed;
        school.employeesAllowableTimeLate = dto.employeesAllowableTimeLate;
        school.employeesTimeLate = dto.employeesTimeLate;
        school.timeBeforeSwipeIsAllowed = dto.timeBeforeSwipeIsAllowed;
        school.smsNotificationForStaffEntry = dto.smsNotificationForStaffEntry;
        school.smsNotificationForStudentBreakTime =
          dto.smsNotificationForStudentBreakTime;
        const timestamp = await entityManager
          .query(CONST_QUERYCURRENT_TIMESTAMP)
          .then((res) => {
            return res[0]["timestamp"];
          });
        school.dateRegistered = timestamp;

        const registeredByUser = await entityManager.findOne(Users, {
          where: {
            userId: dto.registeredByUserId,
            active: true,
          },
        });
        if (!registeredByUser) {
          throw Error(USER_ERROR_USER_NOT_FOUND);
        }
        school.registeredByUser = registeredByUser;
        school = await entityManager.save(school);
        school.schoolCode = generateIndentityCode(school.schoolId);
        school = await entityManager.save(Schools, school);
        delete school.registeredByUser.password;
        schools.push(school);
      }
      return schools;
    });
  }

  async update(schoolCode, dto: UpdateSchoolDto) {
    return await this.schoolsRepo.manager.transaction(async (entityManager) => {
      let schools = await entityManager.findOne(Schools, {
        where: {
          schoolCode,
          active: true,
        },
      });
      if (!schools) {
        throw Error(SCHOOLS_ERROR_NOT_FOUND);
      }
      schools.orgSchoolCode = dto.orgSchoolCode;
      schools.schoolName = dto.schoolName;
      schools.schoolAddress = dto.schoolAddress;
      schools.schoolContactNumber = dto.schoolContactNumber;
      schools.schoolEmail = dto.schoolEmail;
      schools.studentsAllowableTimeLate = dto.studentsAllowableTimeLate;
      schools.studentsTimeLate = dto.studentsTimeLate;
      schools.restrictGuardianTime = dto.restrictGuardianTime;
      schools.employeesTimeBeforeSwipeIsAllowed =
        dto.employeesTimeBeforeSwipeIsAllowed;
      schools.employeesAllowableTimeLate = dto.employeesAllowableTimeLate;
      schools.employeesTimeLate = dto.employeesTimeLate;
      schools.timeBeforeSwipeIsAllowed = dto.timeBeforeSwipeIsAllowed;
      schools.smsNotificationForStaffEntry = dto.smsNotificationForStaffEntry;
      schools.smsNotificationForStudentBreakTime =
        dto.smsNotificationForStudentBreakTime;
      const timestamp = await entityManager
        .query(CONST_QUERYCURRENT_TIMESTAMP)
        .then((res) => {
          return res[0]["timestamp"];
        });
      schools.dateUpdated = timestamp;

      const updatedByUser = await entityManager.findOne(Users, {
        where: {
          userId: dto.updatedByUserId,
          active: true,
        },
      });
      if (!updatedByUser) {
        throw Error(USER_ERROR_USER_NOT_FOUND);
      }
      schools.updatedByUser = updatedByUser;
      schools = await entityManager.save(Schools, schools);
      if (schools?.registeredByUser?.password) {
        delete schools.registeredByUser.password;
      }
      if (schools?.updatedByUser?.password) {
        delete schools.updatedByUser.password;
      }
      return schools;
    });
  }

  async delete(schoolCode) {
    return await this.schoolsRepo.manager.transaction(async (entityManager) => {
      let schools = await entityManager.findOne(Schools, {
        where: {
          schoolCode,
          active: true,
        },
      });
      if (!schools) {
        throw Error(SCHOOLS_ERROR_NOT_FOUND);
      }
      schools.active = false;
      const timestamp = await entityManager
        .query(CONST_QUERYCURRENT_TIMESTAMP)
        .then((res) => {
          return res[0]["timestamp"];
        });
      schools.dateUpdated = timestamp;
      schools = await entityManager.save(Schools, schools);
      if (schools?.registeredByUser?.password) {
        delete schools.registeredByUser.password;
      }
      if (schools?.updatedByUser?.password) {
        delete schools.updatedByUser.password;
      }
      return schools;
    });
  }
}
