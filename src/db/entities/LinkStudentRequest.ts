import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Parents } from "./Parents";
import { Schools } from "./Schools";
import { Students } from "./Students";
import { Users } from "./Users";

@Index("LinkStudentRequest_pkey", ["linkStudentRequestId"], { unique: true })
@Entity("LinkStudentRequest", { schema: "dbo" })
export class LinkStudentRequest {
  @PrimaryGeneratedColumn({ type: "bigint", name: "LinkStudentRequestId" })
  linkStudentRequestId: string;

  @Column("character varying", { name: "Status", default: () => "'PENDING'" })
  status: string;

  @Column("timestamp with time zone", {
    name: "DateRequested",
    default: () => "(now() AT TIME ZONE 'Asia/Manila')",
  })
  dateRequested: Date;

  @Column("timestamp with time zone", { name: "UpdatedDate", nullable: true })
  updatedDate: Date | null;

  @Column("character varying", { name: "Notes", nullable: true })
  notes: string | null;

  @Column("character varying", {
    name: "LinkStudentRequestCode",
    nullable: true,
  })
  linkStudentRequestCode: string | null;

  @ManyToOne(() => Parents, (parents) => parents.linkStudentRequests)
  @JoinColumn([
    { name: "RequestedByParentId", referencedColumnName: "parentId" },
  ])
  requestedByParent: Parents;

  @ManyToOne(() => Schools, (schools) => schools.linkStudentRequests)
  @JoinColumn([{ name: "SchoolId", referencedColumnName: "schoolId" }])
  school: Schools;

  @ManyToOne(() => Students, (students) => students.linkStudentRequests)
  @JoinColumn([{ name: "StudentId", referencedColumnName: "studentId" }])
  student: Students;

  @ManyToOne(() => Users, (users) => users.linkStudentRequests)
  @JoinColumn([{ name: "UpdatedByUserId", referencedColumnName: "userId" }])
  updatedByUser: Users;
}
