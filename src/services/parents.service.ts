import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { extname } from "path";
import { DEPARTMENTS_ERROR_NOT_FOUND } from "src/common/constant/departments.constant";;
import { PARENTS_ERROR_NOT_FOUND } from "src/common/constant/parents.constant";
import { SCHOOL_YEAR_LEVELS_ERROR_NOT_FOUND } from "src/common/constant/school-year-levels.constant";
import { SCHOOLS_ERROR_NOT_FOUND } from "src/common/constant/schools.constant";
import { CONST_QUERYCURRENT_TIMESTAMP } from "src/common/constant/timestamp.constant";
import { USER_ERROR_USER_NOT_FOUND } from "src/common/constant/user-error.constant";
import { USER_TYPE } from "src/common/constant/user-type.constant";
import {
  columnDefToTypeORMCondition,
  hash,
  generateIndentityCode,
} from "src/common/utils/utils";
import { UpdateUserResetPasswordDto } from "src/core/dto/auth/reset-password.dto";
import { UpdateProfilePictureDto } from "src/core/dto/auth/reset-password.dto copy";
import { UpdateParentUserProfileDto } from "src/core/dto/parents/parents.update.dto";
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { Departments } from "src/db/entities/Departments";
import { Files } from "src/db/entities/Files";
import { Parents } from "src/db/entities/Parents";
import { Schools } from "src/db/entities/Schools";
import { Students } from "src/db/entities/Students";
import { UserProfilePic } from "src/db/entities/UserProfilePic";
import { Users } from "src/db/entities/Users";
import { Repository } from "typeorm";
import { v4 as uuid } from "uuid";

@Injectable()
export class ParentsService {
  constructor(
    private firebaseProvoder: FirebaseProvider,
    @InjectRepository(Parents)
    private readonly parentRepo: Repository<Parents>
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);
    const condition = columnDefToTypeORMCondition(columnDef);
    const [results, total] = await Promise.all([
      this.parentRepo.find({
        where: {
          ...condition,
          active: true,
        },
        relations: {
          parentStudents: true,
          registeredByUser: true,
          updatedByUser: true,
          user: true,
        },
        skip,
        take,
        order,
      }),
      this.parentRepo.count({
        where: {
          ...condition,
          active: true,
        },
      }),
    ]);
    return {
      results: results.map((x) => {
        delete x.user.password;
        delete x.registeredByUser.password;
        if (x?.updatedByUser?.password) {
          delete x.updatedByUser.password;
        }
        return x;
      }),
      total,
    };
  }

  async getByCode(parentCode) {
    const res = await this.parentRepo.findOne({
      where: {
        parentCode,
        active: true,
      },
      relations: {
        parentStudents: {
          student: {
            school: true,
            studentCourse: {
              course: true,
            },
            studentStrand: {
              strand: true,
            },
            schoolYearLevel: true,
          },
        },
        registeredByUser: true,
        updatedByUser: true,
        user: true,
      },
    });

    if (!res) {
      throw Error(USER_ERROR_USER_NOT_FOUND);
    }
    res.parentStudents = res.parentStudents.filter((x) => x.active);
    delete res.user.password;
    delete res.registeredByUser.password;
    if (res?.updatedByUser?.password) {
      delete res.updatedByUser.password;
    }
    return res;
  }

  async getParentStudents(parentCode) {
    const res = await this.parentRepo.manager.query<Students[]>(`
    SELECT
s."StudentId", 
s."StudentCode", 
s."DepartmentId", 
s."FirstName", 
s."middleInitial", 
s."LastName", 
s."LRN", 
s."CardNumber", 
s."BirthDate", 
s."MobileNumber", 
s."Email", 
s."Address", 
s."Gender" 
from dbo."Students" s
left join dbo."ParentStudent" ps ON s."StudentId" = ps."StudentId"
left join dbo."Parents" p ON ps."ParentId" = p."ParentId"
WHERE p."ParentCode" = '${parentCode}'
ANd ps."Active" = true
    `);
    return res;
  }

  async updateProfile(parentCode, dto: UpdateParentUserProfileDto) {
    return await this.parentRepo.manager.transaction(async (entityManager) => {
      let parent = await entityManager.findOne(Parents, {
        where: {
          parentCode,
          active: true,
        },
        relations: {
          // parentStudents: true,
          registeredByUser: true,
          updatedByUser: true,
          user: true,
        },
      });

      if (!parent) {
        throw Error(PARENTS_ERROR_NOT_FOUND);
      }

      parent.fullName = dto.fullName;
      parent.mobileNumber = dto.mobileNumber;
      const timestamp = await entityManager
        .query(CONST_QUERYCURRENT_TIMESTAMP)
        .then((res) => {
          return res[0]["timestamp"];
        });
      parent.updatedDate = timestamp;
      parent.updatedByUser = parent.user;
      parent = await entityManager.save(Parents, parent);

      parent = await entityManager.findOne(Parents, {
        where: {
          parentCode,
          active: true,
        },
        relations: {
          parentStudents: true,
          registeredByUser: true,
          updatedByUser: true,
          user: true,
        },
      });
      delete parent.user.password;
      delete parent.registeredByUser.password;
      if (parent?.updatedByUser?.password) {
        delete parent.updatedByUser.password;
      }
      return parent;
    });
  }

  async resetPassword(parentCode, dto: UpdateUserResetPasswordDto) {
    return await this.parentRepo.manager.transaction(async (entityManager) => {
      let parent = await entityManager.findOne(Parents, {
        where: {
          parentCode,
          active: true,
        },
        relations: {
          user: true,
        },
      });

      if (!parent) {
        throw Error(PARENTS_ERROR_NOT_FOUND);
      }

      const user = parent.user;
      user.password = await hash(dto.password);
      await entityManager.save(Users, user);
      parent = await entityManager.findOne(Parents, {
        where: {
          parentCode,
          active: true,
        },
        relations: {
          parentStudents: true,
          registeredByUser: true,
          updatedByUser: true,
          user: true,
        },
      });
      delete parent.user.password;
      delete parent.registeredByUser.password;
      if (parent?.updatedByUser?.password) {
        delete parent.updatedByUser.password;
      }
      return parent;
    });
  }

  async delete(parentCode) {
    return await this.parentRepo.manager.transaction(async (entityManager) => {
      let parent = await entityManager.findOne(Parents, {
        where: {
          parentCode,
          active: true,
        },
        relations: {
          parentStudents: true,
          registeredByUser: true,
          updatedByUser: true,
          user: true,
        },
      });

      if (!parent) {
        throw Error(PARENTS_ERROR_NOT_FOUND);
      }

      parent.active = false;
      await entityManager.save(Parents, parent);
      const user = parent.user;
      user.active = false;
      await entityManager.save(Users, user);
      parent = await entityManager.findOne(Parents, {
        where: {
          parentCode,
        },
        relations: {
          parentStudents: true,
          registeredByUser: true,
          updatedByUser: true,
          user: true,
        },
      });
      delete parent.user.password;
      delete parent.registeredByUser.password;
      if (parent?.updatedByUser?.password) {
        delete parent.updatedByUser.password;
      }
      return parent;
    });
  }

  async approveAccessRequest(parentCode) {
    return await this.parentRepo.manager.transaction(async (entityManager) => {
      let parent = await entityManager.findOne(Parents, {
        where: {
          parentCode,
          active: true,
        },
        relations: {
          parentStudents: true,
          registeredByUser: true,
          updatedByUser: true,
          user: true,
        },
      });

      if (!parent) {
        throw Error(PARENTS_ERROR_NOT_FOUND);
      }

      await entityManager.save(Parents, parent);
      parent = await entityManager.findOne(Parents, {
        where: {
          parentCode,
        },
        relations: {
          parentStudents: true,
          registeredByUser: true,
          updatedByUser: true,
          user: true,
        },
      });
      delete parent.user.password;
      delete parent.registeredByUser.password;
      if (parent?.updatedByUser?.password) {
        delete parent.updatedByUser.password;
      }
      return parent;
    });
  }

  async updateProfilePicture(parentCode, dto: UpdateProfilePictureDto) {
    return await this.parentRepo.manager.transaction(async (entityManager) => {
      const user: any = await entityManager.findOne(Users, {
        where: {
          parents: {
            parentCode,
          },
        },
      });
      if (!user) {
        throw new HttpException(`User doesn't exist`, HttpStatus.NOT_FOUND);
      }
      if (dto.userProfilePic) {
        const newFileName: string = uuid();
        let userProfilePic = await entityManager.findOne(UserProfilePic, {
          where: { userId: user.userId },
          relations: ["file"],
        });
        const bucket = this.firebaseProvoder.app.storage().bucket();
        if (userProfilePic) {
          try {
            const deleteFile = bucket.file(
              `profile/${userProfilePic.file.fileName}`
            );
            deleteFile.delete();
          } catch (ex) {
            console.log(ex);
          }
          const file = userProfilePic.file;
          file.fileName = `${newFileName}${extname(
            dto.userProfilePic.fileName
          )}`;

          const bucketFile = bucket.file(
            `profile/${newFileName}${extname(dto.userProfilePic.fileName)}`
          );
          const img = Buffer.from(dto.userProfilePic.data, "base64");
          await bucketFile.save(img).then(async (res) => {
            console.log("res");
            console.log(res);
            const url = await bucketFile.getSignedUrl({
              action: "read",
              expires: "03-09-2500",
            });

            file.url = url[0];
            userProfilePic.file = await entityManager.save(Files, file);
            user.userProfilePic = await entityManager.save(
              UserProfilePic,
              userProfilePic
            );
          });
        } else {
          userProfilePic = new UserProfilePic();
          userProfilePic.user = user;
          const file = new Files();
          file.fileName = `${newFileName}${extname(
            dto.userProfilePic.fileName
          )}`;
          const bucketFile = bucket.file(
            `profile/${newFileName}${extname(dto.userProfilePic.fileName)}`
          );
          const img = Buffer.from(dto.userProfilePic.data, "base64");
          await bucketFile.save(img).then(async () => {
            const url = await bucketFile.getSignedUrl({
              action: "read",
              expires: "03-09-2500",
            });
            file.url = url[0];
            userProfilePic.file = await entityManager.save(Files, file);
            user.userProfilePic = await entityManager.save(
              UserProfilePic,
              userProfilePic
            );
          });
        }
      }
      const parent = await entityManager.findOne(Parents, {
        where: {
          parentCode,
        },
        relations: {
          parentStudents: true,
          registeredByUser: true,
          updatedByUser: true,
          user: {
            userProfilePic: {
              file: true,
            },
          },
        },
      });
      delete parent.user.password;
      delete parent.registeredByUser.password;
      if (parent?.updatedByUser?.password) {
        delete parent.updatedByUser.password;
      }
      return parent;
    });
  }
}
