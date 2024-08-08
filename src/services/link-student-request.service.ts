import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LINKSTUDENTREQUEST_ERROR_NOT_FOUND } from "src/common/constant/link-student-request.constant";
import {
  NOTIF_TITLE,
  NOTIF_TYPE,
} from "src/common/constant/notifications.constant";
import { SCHOOLS_ERROR_NOT_FOUND } from "src/common/constant/schools.constant";
import { CONST_QUERYCURRENT_TIMESTAMP } from "src/common/constant/timestamp.constant";
import { USER_ERROR_USER_NOT_FOUND } from "src/common/constant/user-error.constant";
import {
  columnDefToTypeORMCondition,
  generateIndentityCode,
} from "src/common/utils/utils";
import { CreateLinkStudentRequestDto } from "src/core/dto/link-student-request/link-student-request.create.dto";
import {
  UpdateLinkStudentRequestDto,
  UpdateLinkStudentRequestStatusDto,
} from "src/core/dto/link-student-request/link-student-request.update.dto";
import { LinkStudentRequest } from "src/db/entities/LinkStudentRequest";
import { Notifications } from "src/db/entities/Notifications";
import { Schools } from "src/db/entities/Schools";
import { Students } from "src/db/entities/Students";
import { Users } from "src/db/entities/Users";
import { EntityManager, Repository } from "typeorm";
import { PusherService } from "./pusher.service";
import { Parents } from "src/db/entities/Parents";
import { ParentStudent } from "src/db/entities/ParentStudent";
import { PARENTS_ERROR_NOT_FOUND } from "src/common/constant/parents.constant";
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { MessagingDevicesResponse } from "firebase-admin/lib/messaging/messaging-api";
import { UserFirebaseToken } from "src/db/entities/UserFirebaseToken";
import { OneSignalNotificationService } from "./one-signal-notification.service";
import { UserOneSignalSubscription } from "src/db/entities/UserOneSignalSubscription";

@Injectable()
export class LinkStudentRequestService {
  constructor(
    @InjectRepository(LinkStudentRequest)
    private readonly linkStudentRequestRepo: Repository<LinkStudentRequest>,
    private pusherService: PusherService,
    private firebaseProvoder: FirebaseProvider,
    private oneSignalNotificationService: OneSignalNotificationService
  ) {}
  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);

    const condition = columnDefToTypeORMCondition(columnDef);
    const [results, total] = await Promise.all([
      this.linkStudentRequestRepo.find({
        where: condition,
        relations: {
          student: true,
          school: true,
          requestedByParent: true,
          updatedByUser: true,
        },
        skip,
        take,
        order,
      }),
      this.linkStudentRequestRepo.count({
        where: condition,
      }),
    ]);
    return {
      results: results.map((x) => {
        if (x?.updatedByUser?.password) {
          delete x.updatedByUser.password;
        }
        return x;
      }),
      total,
    };
  }
  async getByCode(linkStudentRequestCode) {
    const result = await this.linkStudentRequestRepo.findOne({
      where: {
        linkStudentRequestCode,
      },
      relations: {
        student: true,
        school: true,
        requestedByParent: true,
        updatedByUser: true,
      },
    });
    if (!result) {
      throw Error(LINKSTUDENTREQUEST_ERROR_NOT_FOUND);
    }
    if (result?.updatedByUser?.password) {
      delete result.updatedByUser.password;
    }
    return result;
  }

  async create(dto: CreateLinkStudentRequestDto) {
    return await this.linkStudentRequestRepo.manager.transaction(
      async (entityManager) => {
        let linkStudentRequest = await entityManager.findOne(
          LinkStudentRequest,
          {
            where: {
              requestedByParent: {
                parentId: dto.requestedByParentId,
              },
              student: {
                studentId: dto.studentId,
              },
              status: "PENDING",
            },
            relations: {
              requestedByParent: true,
              student: true,
            },
          }
        );
        if (linkStudentRequest) {
          throw Error(
            "A request to link " +
              linkStudentRequest.student.fullName +
              " was already created by " +
              linkStudentRequest.requestedByParent.fullName
          );
        }
        const parentStudent = await entityManager.findOne(ParentStudent, {
          where: {
            parent: {
              parentId: dto.requestedByParentId,
              active: true,
            },
            student: {
              studentId: dto.studentId,
            },
          },
          relations: {
            parent: true,
            student: true,
          },
        });
        if (parentStudent) {
          throw Error(
            "Student " +
              parentStudent.student.fullName +
              " was already linked to parent " +
              parentStudent.parent.fullName
          );
        }
        linkStudentRequest = new LinkStudentRequest();
        const timestamp = await entityManager
          .query(CONST_QUERYCURRENT_TIMESTAMP)
          .then((res) => {
            return res[0]["timestamp"];
          });
        linkStudentRequest.dateRequested = timestamp;

        const requestedByParent = await entityManager.findOne(Parents, {
          where: {
            parentId: dto.requestedByParentId,
            active: true,
          },
        });
        if (!requestedByParent) {
          throw Error(PARENTS_ERROR_NOT_FOUND);
        }
        linkStudentRequest.requestedByParent = requestedByParent;

        const school = await entityManager.findOne(Schools, {
          where: {
            schoolId: dto.schoolId,
            active: true,
          },
        });
        if (!school) {
          throw Error(SCHOOLS_ERROR_NOT_FOUND);
        }
        linkStudentRequest.school = school;

        const student = await entityManager.findOne(Students, {
          where: {
            studentId: dto.studentId,
            active: true,
          },
        });
        if (!student) {
          throw Error(SCHOOLS_ERROR_NOT_FOUND);
        }
        linkStudentRequest.student = student;

        linkStudentRequest = await entityManager.save(linkStudentRequest);
        linkStudentRequest.linkStudentRequestCode = generateIndentityCode(
          linkStudentRequest.linkStudentRequestId
        );
        linkStudentRequest = await entityManager.save(
          LinkStudentRequest,
          linkStudentRequest
        );
        return linkStudentRequest;
      }
    );
  }
  async approve(
    linkStudentRequestCode,
    dto: UpdateLinkStudentRequestStatusDto
  ) {
    return await this.linkStudentRequestRepo.manager.transaction(
      async (entityManager) => {
        let linkStudentRequest = await entityManager.findOne(
          LinkStudentRequest,
          {
            where: {
              linkStudentRequestCode,
            },
            relations: {
              student: true,
              school: true,
              requestedByParent: true,
              updatedByUser: true,
            },
          }
        );
        if (!linkStudentRequest) {
          throw Error(LINKSTUDENTREQUEST_ERROR_NOT_FOUND);
        }
        if (
          linkStudentRequest.status === "APPROVED" ||
          linkStudentRequest.status === "CANCELLED" ||
          linkStudentRequest.status === "REJECTED"
        ) {
          throw Error(
            "Not allowed to update status, request was already - " +
              linkStudentRequest.status.toLowerCase()
          );
        }
        linkStudentRequest.status = "APPROVED";
        const timestamp = await entityManager
          .query(CONST_QUERYCURRENT_TIMESTAMP)
          .then((res) => {
            return res[0]["timestamp"];
          });
        linkStudentRequest.updatedDate = timestamp;

        const updatedByUser = await entityManager.findOne(Users, {
          where: {
            userId: dto.updatedByUserId,
            active: true,
          },
        });
        if (!updatedByUser) {
          throw Error(USER_ERROR_USER_NOT_FOUND);
        }
        linkStudentRequest.updatedByUser = updatedByUser;

        let parentStudent = await entityManager.findOne(ParentStudent, {
          where: {
            parent: {
              parentId: linkStudentRequest.requestedByParent.parentId,
            },
            student: {
              studentId: linkStudentRequest.student.studentId,
            },
          },
          relations: {
            parent: true,
            student: true,
          },
        });
        if (!parentStudent) {
          parentStudent = new ParentStudent();
          parentStudent.parent = await entityManager.findOne(Parents, {
            where: {
              parentId: linkStudentRequest.requestedByParent.parentId,
            },
          });
          parentStudent.student = linkStudentRequest.student;
          await entityManager.save(ParentStudent, parentStudent);
        }
        linkStudentRequest = await entityManager.save(
          LinkStudentRequest,
          linkStudentRequest
        );
        linkStudentRequest = await entityManager.findOne(LinkStudentRequest, {
          where: {
            linkStudentRequestCode: linkStudentRequest.linkStudentRequestCode,
          },
          relations: {
            student: true,
            school: true,
            requestedByParent: {
              user: true,
            },
            updatedByUser: true,
          },
        });
        const notifTitle = NOTIF_TITLE.LINK_REQUEST_APPROVED;
        const notifDesc =
          "Request to Link Student " +
          linkStudentRequest.student?.fullName +
          " was approved!";
        const notificationIds = await this.logNotification(
          linkStudentRequest.requestedByParent.user,
          linkStudentRequest.linkStudentRequestCode,
          entityManager,
          notifTitle,
          notifDesc
        );
        const pushResult =
          await this.oneSignalNotificationService.sendToExternalUser(
            linkStudentRequest?.requestedByParent?.user?.userName,
            NOTIF_TYPE.LINK_REQUEST.toString() as any,
            linkStudentRequest.linkStudentRequestCode,
            notificationIds,
            notifTitle,
            notifDesc
          );
        console.log(pushResult);
        delete linkStudentRequest.requestedByParent.user.password;
        delete linkStudentRequest.updatedByUser.password;
        return linkStudentRequest;
      }
    );
  }
  async reject(linkStudentRequestCode, dto: UpdateLinkStudentRequestStatusDto) {
    return await this.linkStudentRequestRepo.manager.transaction(
      async (entityManager) => {
        let linkStudentRequest = await entityManager.findOne(
          LinkStudentRequest,
          {
            where: {
              linkStudentRequestCode,
            },
            relations: {
              student: true,
              school: true,
              requestedByParent: true,
              updatedByUser: true,
            },
          }
        );
        if (!linkStudentRequest) {
          throw Error(LINKSTUDENTREQUEST_ERROR_NOT_FOUND);
        }
        if (
          linkStudentRequest.status === "APPROVED" ||
          linkStudentRequest.status === "CANCELLED" ||
          linkStudentRequest.status === "REJECTED"
        ) {
          throw Error(
            "Not allowed to update status, request was already - " +
              linkStudentRequest.status.toLowerCase()
          );
        }
        linkStudentRequest.status = "REJECTED";
        const timestamp = await entityManager
          .query(CONST_QUERYCURRENT_TIMESTAMP)
          .then((res) => {
            return res[0]["timestamp"];
          });
        linkStudentRequest.updatedDate = timestamp;

        const updatedByUser = await entityManager.findOne(Users, {
          where: {
            userId: dto.updatedByUserId,
            active: true,
          },
        });
        if (!updatedByUser) {
          throw Error(USER_ERROR_USER_NOT_FOUND);
        }
        linkStudentRequest.updatedByUser = updatedByUser;
        linkStudentRequest = await entityManager.save(
          LinkStudentRequest,
          linkStudentRequest
        );
        linkStudentRequest = await entityManager.findOne(LinkStudentRequest, {
          where: {
            linkStudentRequestCode: linkStudentRequest.linkStudentRequestCode,
          },
          relations: {
            student: true,
            school: true,
            requestedByParent: {
              user: true,
            },
            updatedByUser: true,
          },
        });
        const notifTitle = NOTIF_TITLE.LINK_REQUEST_REJECTED;
        const notifDesc =
          "Request to Link Student " +
          linkStudentRequest.student?.fullName +
          " was rejected!";
        const notificationIds = await this.logNotification(
          linkStudentRequest.requestedByParent.user,
          linkStudentRequest.linkStudentRequestCode,
          entityManager,
          notifTitle,
          notifDesc
        );
        const pushResult =
          await this.oneSignalNotificationService.sendToExternalUser(
            linkStudentRequest?.requestedByParent?.user?.userName,
            NOTIF_TYPE.LINK_REQUEST.toString() as any,
            linkStudentRequest.linkStudentRequestCode,
            notificationIds,
            notifTitle,
            notifDesc
          );
        console.log(pushResult);
        delete linkStudentRequest.requestedByParent.user.password;
        delete linkStudentRequest.updatedByUser.password;
        return linkStudentRequest;
      }
    );
  }
  async cancel(linkStudentRequestCode, dto: UpdateLinkStudentRequestStatusDto) {
    return await this.linkStudentRequestRepo.manager.transaction(
      async (entityManager) => {
        let linkStudentRequest = await entityManager.findOne(
          LinkStudentRequest,
          {
            where: {
              linkStudentRequestCode,
            },
            relations: {
              student: true,
              school: true,
              requestedByParent: true,
              updatedByUser: true,
            },
          }
        );
        if (!linkStudentRequest) {
          throw Error(LINKSTUDENTREQUEST_ERROR_NOT_FOUND);
        }
        if (
          linkStudentRequest.status === "APPROVED" ||
          linkStudentRequest.status === "CANCELLED" ||
          linkStudentRequest.status === "REJECTED"
        ) {
          throw Error(
            "Not allowed to update status, request was already - " +
              linkStudentRequest.status.toLowerCase()
          );
        }
        linkStudentRequest.status = "CANCELLED";
        const timestamp = await entityManager
          .query(CONST_QUERYCURRENT_TIMESTAMP)
          .then((res) => {
            return res[0]["timestamp"];
          });
        linkStudentRequest.updatedDate = timestamp;

        const updatedByUser = await entityManager.findOne(Users, {
          where: {
            userId: dto.updatedByUserId,
            active: true,
          },
        });
        if (!updatedByUser) {
          throw Error(USER_ERROR_USER_NOT_FOUND);
        }
        linkStudentRequest.updatedByUser = updatedByUser;
        linkStudentRequest = await entityManager.save(
          LinkStudentRequest,
          linkStudentRequest
        );
        linkStudentRequest = await entityManager.findOne(LinkStudentRequest, {
          where: {
            linkStudentRequestCode: linkStudentRequest.linkStudentRequestCode,
          },
          relations: {
            student: true,
            school: true,
            requestedByParent: true,
            updatedByUser: true,
          },
        });
        delete linkStudentRequest.updatedByUser.password;
        return linkStudentRequest;
      }
    );
  }

  async logNotification(
    user: Users,
    referenceId,
    entityManager: EntityManager,
    title: string,
    description: string
  ) {
    const notifcation = {
      title,
      description,
      type: NOTIF_TYPE.LINK_REQUEST.toString(),
      referenceId,
      isRead: false,
      forUser: user,
    };
    const res: any = await entityManager.save(Notifications, notifcation);
    const notifcationIds = [res.notificationId];
    await this.pusherService.sendNotif(
      [user.userId],
      notifcationIds,
      referenceId,
      NOTIF_TYPE.LINK_REQUEST.toString() as any,
      title,
      description
    );
    return notifcationIds;
  }

  // async firebaseSendToDevice(token, title, description) {
  //   return await this.firebaseProvoder.app
  //     .messaging()
  //     .sendToDevice(
  //       token,
  //       {
  //         notification: {
  //           title: title,
  //           body: description,
  //           sound: "notif_alert",
  //         },
  //       },
  //       {
  //         priority: "high",
  //         timeToLive: 60 * 24,
  //         android: { sound: "notif_alert" },
  //       }
  //     )
  //     .then((response: MessagingDevicesResponse) => {
  //       console.log("Successfully sent message:", response);
  //     })
  //     .catch((error) => {
  //       throw new HttpException(
  //         `Error sending notif! ${error.message}`,
  //         HttpStatus.BAD_REQUEST
  //       );
  //     });
  // }
}
