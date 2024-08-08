import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Parents } from "./Parents";
import { Students } from "./Students";

@Index("ParentStudent_pkey", ["parentId", "studentId"], { unique: true })
@Entity("ParentStudent", { schema: "dbo" })
export class ParentStudent {
  @Column("bigint", { primary: true, name: "ParentId" })
  parentId: string;

  @Column("bigint", { primary: true, name: "StudentId" })
  studentId: string;

  @Column("timestamp with time zone", {
    name: "DateAdded",
    default: () => "(now() AT TIME ZONE 'Asia/Manila')",
  })
  dateAdded: Date;

  @Column("boolean", { name: "Active", default: () => "true" })
  active: boolean;

  @ManyToOne(() => Parents, (parents) => parents.parentStudents)
  @JoinColumn([{ name: "ParentId", referencedColumnName: "parentId" }])
  parent: Parents;

  @ManyToOne(() => Students, (students) => students.parentStudents)
  @JoinColumn([{ name: "StudentId", referencedColumnName: "studentId" }])
  student: Students;
}
