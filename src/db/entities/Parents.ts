import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LinkStudentRequest } from "./LinkStudentRequest";
import { ParentStudent } from "./ParentStudent";
import { Users } from "./Users";

@Index("u_parents_email", ["active", "email"], { unique: true })
@Index("u_parents_number", ["active", "mobileNumber"], { unique: true })
@Index("Parents_pkey", ["parentId"], { unique: true })
@Entity("Parents", { schema: "dbo" })
export class Parents {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ParentId" })
  parentId: string;

  @Column("character varying", { name: "ParentCode", nullable: true })
  parentCode: string | null;

  @Column("character varying", { name: "FullName", default: () => "''" })
  fullName: string;

  @Column("character varying", { name: "MobileNumber" })
  mobileNumber: string;

  @Column("character varying", { name: "Email", nullable: true })
  email: string | null;

  @Column("timestamp with time zone", {
    name: "RegistrationDate",
    default: () => "(now() AT TIME ZONE 'Asia/Manila')",
  })
  registrationDate: Date;

  @Column("timestamp with time zone", { name: "UpdatedDate", nullable: true })
  updatedDate: Date | null;

  @Column("boolean", { name: "Active", default: () => "true" })
  active: boolean;

  @OneToMany(
    () => LinkStudentRequest,
    (linkStudentRequest) => linkStudentRequest.requestedByParent
  )
  linkStudentRequests: LinkStudentRequest[];

  @OneToMany(() => ParentStudent, (parentStudent) => parentStudent.parent)
  parentStudents: ParentStudent[];

  @ManyToOne(() => Users, (users) => users.parents)
  @JoinColumn([{ name: "RegisteredByUserId", referencedColumnName: "userId" }])
  registeredByUser: Users;

  @ManyToOne(() => Users, (users) => users.parents2)
  @JoinColumn([{ name: "UpdatedByUserId", referencedColumnName: "userId" }])
  updatedByUser: Users;

  @ManyToOne(() => Users, (users) => users.parents3)
  @JoinColumn([{ name: "UserId", referencedColumnName: "userId" }])
  user: Users;
}
