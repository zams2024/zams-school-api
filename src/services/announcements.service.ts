import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment";
import {
  ANNOUNCEMENTS_ERROR_NOT_FOUND,
  ANNOUNCEMENTS_STATUS,
  ANNOUNCEMENT_RECIPIENTS_TYPE,
} from "src/common/constant/announcements.constant";
import { DateConstant } from "src/common/constant/date.constant";
import { DEPARTMENTS_ERROR_NOT_FOUND } from "src/common/constant/departments.constant";
import { SCHOOLS_ERROR_NOT_FOUND } from "src/common/constant/schools.constant";
import { CONST_QUERYCURRENT_TIMESTAMP } from "src/common/constant/timestamp.constant";
import { USER_ERROR_USER_NOT_FOUND } from "src/common/constant/user-error.constant";
import {
  columnDefToTypeORMCondition,
  generateIndentityCode,
} from "src/common/utils/utils";
import { CreateAnnouncementDto } from "src/core/dto/announcements/announcements.create.dto";
import { UpdateAnnouncementDto } from "src/core/dto/announcements/announcements.update.dto";
import { AnnouncementRecipient } from "src/db/entities/AnnouncementRecipient";
import { Announcements } from "src/db/entities/Announcements";
import { Schools } from "src/db/entities/Schools";
import { Students } from "src/db/entities/Students";
import { Users } from "src/db/entities/Users";
import { Not, Repository } from "typeorm";

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcements)
    private readonly announcementsRepo: Repository<Announcements>
  ) {}

  async getAnnouncementsPagination({ pageSize, pageIndex, order, columnDef }) {
    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);

    const condition = columnDefToTypeORMCondition(columnDef);
    const [results, total] = await Promise.all([
      this.announcementsRepo.find({
        where: {
          ...condition,
          active: true,
        },
        relations: {
          createdByUser: true,
          updatedByUser: true,
        },
        skip,
        take,
        order,
      }),
      this.announcementsRepo.count({
        where: {
          ...condition,
          active: true,
        },
      }),
    ]);
    return {
      results: results.map((x) => {
        delete x.createdByUser.password;
        if (x?.updatedByUser?.password) {
          delete x.updatedByUser.password;
        }
        return x;
      }),
      total,
    };
  }

  async getByCode(announcementCode) {
    const result = await this.announcementsRepo.findOne({
      where: {
        announcementCode,
        active: true,
      },
      relations: {
        createdByUser: true,
        updatedByUser: true,
        announcementRecipients: true,
      },
    });
    if (!result) {
      throw Error(ANNOUNCEMENTS_ERROR_NOT_FOUND);
    }
    // result.announcementRecipients = await this.announcementsRepo.manager.find(
    //   AnnouncementRecipient,
    //   {
    //     where: {
    //       announcement: {
    //         announcementId: result.announcementId,
    //       },
    //     },
    //   }
    // );
    delete result.createdByUser.password;
    if (result?.updatedByUser?.password) {
      delete result.updatedByUser.password;
    }
    return result;
  }

  async create(dto: CreateAnnouncementDto) {
    try {
      return await this.announcementsRepo.manager.transaction(
        async (entityManager) => {
          const targetDate = moment(
            new Date(dto.targetDate),
            DateConstant.DATE_LANGUAGE
          ).format("YYYY-MM-DD");
          let announcements = new Announcements();
          announcements.title = dto.title;
          announcements.description = dto.description;
          announcements.targetDate = targetDate;
          announcements.targetTime = dto.targetTime;
          announcements.isSchedule = dto.isSchedule;
          announcements.status =
            dto.actions === "SEND"
              ? dto.isSchedule
                ? ANNOUNCEMENTS_STATUS.PENDING
                : ANNOUNCEMENTS_STATUS.SENDING
              : announcements.status;
          const timestamp = await entityManager
            .query(CONST_QUERYCURRENT_TIMESTAMP)
            .then((res) => {
              return res[0]["timestamp"];
            });
          announcements.createdDate = timestamp;

          const school = await entityManager.findOne(Schools, {
            where: {
              schoolId: dto.schoolId,
              active: true,
            },
          });
          if (!school) {
            throw Error(SCHOOLS_ERROR_NOT_FOUND);
          }
          announcements.school = school;

          const createdByUser = await entityManager.findOne(Users, {
            where: {
              userId: dto.createdByUserId,
              active: true,
            },
          });
          if (!createdByUser) {
            throw Error(USER_ERROR_USER_NOT_FOUND);
          }
          announcements.createdByUser = createdByUser;
          announcements = await entityManager.save(announcements);
          announcements.announcementCode = generateIndentityCode(
            announcements.announcementId
          );
          announcements = await entityManager.save(
            Announcements,
            announcements
          );
          const announcementRecipients = this.createAnnouncementRecipients(
            dto,
            announcements
          );
          await entityManager.save(
            AnnouncementRecipient,
            announcementRecipients
          );

          announcements = await entityManager.findOne(Announcements, {
            where: {
              announcementId: announcements.announcementId,
            },
            relations: {
              createdByUser: true,
              announcementRecipients: true,
            },
          });
          delete announcements.createdByUser.password;
          return announcements;
        }
      );
    } catch (ex) {
      if (
        ex["message"] &&
        (ex["message"].includes("duplicate key") ||
          ex["message"].includes("violates unique constraint")) &&
        ex["message"].includes("u_announcement")
      ) {
        throw Error("Entry already exists!");
      } else {
        throw ex;
      }
    }
  }

  async update(announcementCode, dto: UpdateAnnouncementDto) {
    try {
      return await this.announcementsRepo.manager.transaction(
        async (entityManager) => {
          const targetDate = moment(
            new Date(dto.targetDate),
            DateConstant.DATE_LANGUAGE
          ).format("YYYY-MM-DD");
          let announcements = await entityManager.findOne(Announcements, {
            where: {
              announcementCode,
              active: true,
            },
          });
          if (!announcements) {
            throw Error(ANNOUNCEMENTS_ERROR_NOT_FOUND);
          }
          if (announcements.status !== ANNOUNCEMENTS_STATUS.DRAFT) {
            throw Error(
              `Cannot edit ${announcements.status.toLowerCase()} Announcement!`
            );
          }
          const timestamp = await entityManager
            .query(CONST_QUERYCURRENT_TIMESTAMP)
            .then((res) => {
              return res[0]["timestamp"];
            });
          announcements.updatedDate = timestamp;

          const updatedByUser = await entityManager.findOne(Users, {
            where: {
              userId: dto.updatedByUserId,
              active: true,
            },
          });
          if (!updatedByUser) {
            throw Error(USER_ERROR_USER_NOT_FOUND);
          }
          announcements.updatedByUser = updatedByUser;
          announcements.title = dto.title;
          announcements.description = dto.description;
          announcements.targetDate = targetDate;
          announcements.targetTime = dto.targetTime;
          announcements.isSchedule = dto.isSchedule;
          announcements.status =
            dto.actions === "SEND"
              ? dto.isSchedule
                ? ANNOUNCEMENTS_STATUS.PENDING
                : ANNOUNCEMENTS_STATUS.SENDING
              : announcements.status;
          announcements = await entityManager.save(
            Announcements,
            announcements
          );

          let announcementRecipients = await entityManager.find(
            AnnouncementRecipient,
            {
              where: {
                announcement: {
                  announcementId: announcements.announcementId,
                },
              },
            }
          );

          await entityManager.delete(
            AnnouncementRecipient,
            announcementRecipients
          );
          announcementRecipients = this.createAnnouncementRecipients(
            dto,
            announcements
          );
          await entityManager.save(
            AnnouncementRecipient,
            announcementRecipients
          );
          if (announcements?.createdByUser?.password) {
            delete announcements.createdByUser.password;
          }
          if (announcements?.updatedByUser?.password) {
            delete announcements.updatedByUser.password;
          }
          return announcements;
        }
      );
    } catch (ex) {
      if (
        ex["message"] &&
        (ex["message"].includes("duplicate key") ||
          ex["message"].includes("violates unique constraint")) &&
        ex["message"].includes("u_announcement")
      ) {
        throw Error("Entry already exists!");
      } else {
        throw ex;
      }
    }
  }

  async cancel(announcementCode) {
    return await this.announcementsRepo.manager.transaction(
      async (entityManager) => {
        const announcements = await entityManager.findOne(Announcements, {
          where: {
            announcementCode,
            active: true,
          },
        });
        if (!announcements) {
          throw Error(ANNOUNCEMENTS_ERROR_NOT_FOUND);
        }
        if (
          announcements.status !== ANNOUNCEMENTS_STATUS.DRAFT ||
          announcements.status !== ANNOUNCEMENTS_STATUS.PENDING
        ) {
          throw Error(
            `Cannot cancel ${announcements.status.toLowerCase()} Announcement!`
          );
        }
        announcements.status = ANNOUNCEMENTS_STATUS.CANCELLED;
        const timestamp = await entityManager
          .query(CONST_QUERYCURRENT_TIMESTAMP)
          .then((res) => {
            return res[0]["timestamp"];
          });
        announcements.updatedDate = timestamp;
        return await entityManager.save(Announcements, announcements);
      }
    );
  }

  async delete(announcementCode) {
    return await this.announcementsRepo.manager.transaction(
      async (entityManager) => {
        const announcements = await entityManager.findOne(Announcements, {
          where: {
            announcementCode,
            active: true,
          },
        });
        if (!announcements) {
          throw Error(ANNOUNCEMENTS_ERROR_NOT_FOUND);
        }
        announcements.active = false;
        const timestamp = await entityManager
          .query(CONST_QUERYCURRENT_TIMESTAMP)
          .then((res) => {
            return res[0]["timestamp"];
          });
        announcements.updatedDate = timestamp;
        return await entityManager.save(Announcements, announcements);
      }
    );
  }

  createAnnouncementRecipients(
    dto: CreateAnnouncementDto | UpdateAnnouncementDto,
    announcements: Announcements
  ) {
    const announcementRecipients: AnnouncementRecipient[] = [];
    if (
      dto.basicEdStudentRecipients &&
      dto.basicEdStudentRecipients.length > 0
    ) {
      for (const recipient of dto.basicEdStudentRecipients) {
        if (
          announcementRecipients.some(
            (x) =>
              x.groupReferenceId === recipient.sectionId &&
              x.type === ANNOUNCEMENT_RECIPIENTS_TYPE.BASIC_ED
          )
        ) {
          const index = announcementRecipients.findIndex(
            (x) =>
              x.groupReferenceId === recipient.sectionId &&
              x.type === ANNOUNCEMENT_RECIPIENTS_TYPE.BASIC_ED
          );
          const newExcludedIds = [
            ...announcementRecipients[index].excludedIds,
            ...recipient.excludedStudentIds,
          ];
          announcementRecipients[index].excludedIds = [
            ...new Set(newExcludedIds),
          ];
        } else {
          const announcementRecipient = new AnnouncementRecipient();
          announcementRecipient.type = ANNOUNCEMENT_RECIPIENTS_TYPE.BASIC_ED;
          announcementRecipient.announcement = announcements;
          announcementRecipient.groupReferenceId = recipient.sectionId;
          announcementRecipient.excludedIds = [
            ...new Set(recipient.excludedStudentIds),
          ];
          announcementRecipients.push(announcementRecipient);
        }
      }
    }
    if (
      dto.higherEdStudenttudentRecipients &&
      dto.higherEdStudenttudentRecipients.length > 0
    ) {
      for (const recipient of dto.higherEdStudenttudentRecipients) {
        if (
          announcementRecipients.some(
            (x) =>
              x.groupReferenceId === recipient.sectionId &&
              x.type === ANNOUNCEMENT_RECIPIENTS_TYPE.HIGHER_ED
          )
        ) {
          const index = announcementRecipients.findIndex(
            (x) =>
              x.groupReferenceId === recipient.sectionId &&
              x.type === ANNOUNCEMENT_RECIPIENTS_TYPE.HIGHER_ED
          );
          const newExcludedIds = [
            ...announcementRecipients[index].excludedIds,
            ...recipient.excludedStudentIds,
          ];
          announcementRecipients[index].excludedIds = [
            ...new Set(newExcludedIds),
          ];
        } else {
          const announcementRecipient = new AnnouncementRecipient();
          announcementRecipient.type = ANNOUNCEMENT_RECIPIENTS_TYPE.HIGHER_ED;
          announcementRecipient.announcement = announcements;
          announcementRecipient.groupReferenceId = recipient.sectionId;
          announcementRecipient.excludedIds = [
            ...new Set(recipient.excludedStudentIds),
          ];
          announcementRecipients.push(announcementRecipient);
        }
      }
    }
    if (dto.employeeRecipients && dto.employeeRecipients.length > 0) {
      for (const recipient of dto.employeeRecipients) {
        if (
          announcementRecipients.some(
            (x) =>
              x.groupReferenceId === recipient.employeeTitleId &&
              x.type === ANNOUNCEMENT_RECIPIENTS_TYPE.EMPLOYEE
          )
        ) {
          const index = announcementRecipients.findIndex(
            (x) =>
              x.groupReferenceId === recipient.employeeTitleId &&
              x.type === ANNOUNCEMENT_RECIPIENTS_TYPE.EMPLOYEE
          );

          const newExcludedIds = [
            ...announcementRecipients[index].excludedIds,
            ...recipient.excludedEmployeeIds,
          ];
          announcementRecipients[index].excludedIds = [
            ...new Set(newExcludedIds),
          ];
        } else {
          const announcementRecipient = new AnnouncementRecipient();
          announcementRecipient.type = ANNOUNCEMENT_RECIPIENTS_TYPE.EMPLOYEE;
          announcementRecipient.announcement = announcements;
          announcementRecipient.groupReferenceId = recipient.employeeTitleId;
          announcementRecipient.excludedIds = [
            ...new Set(recipient.excludedEmployeeIds),
          ];
          announcementRecipients.push(announcementRecipient);
        }
      }
    }
    return announcementRecipients;
  }
}
