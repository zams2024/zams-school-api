import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AnnouncementRecipient } from "./AnnouncementRecipient";
import { Users } from "./Users";
import { Schools } from "./Schools";

@Index("Announcements_pkey", ["announcementId"], { unique: true })
@Entity("Announcements", { schema: "dbo" })
export class Announcements {
  @PrimaryGeneratedColumn({ type: "bigint", name: "AnnouncementId" })
  announcementId: string;

  @Column("character varying", { name: "AnnouncementCode", nullable: true })
  announcementCode: string | null;

  @Column("character varying", {
    name: "Status",
    nullable: true,
    default: () => "'DRAFT'",
  })
  status: string | null;

  @Column("character varying", { name: "Title" })
  title: string;

  @Column("character varying", { name: "Description" })
  description: string;

  @Column("boolean", { name: "IsSchedule", default: () => "false" })
  isSchedule: boolean;

  @Column("date", {
    name: "TargetDate",
    default: () => "(now() AT TIME ZONE 'Asia/Manila')",
  })
  targetDate: string;

  @Column("character varying", { name: "TargetTime" })
  targetTime: string;

  @Column("timestamp with time zone", {
    name: "DateSent",
    default: () => "(now() AT TIME ZONE 'Asia/Manila')",
  })
  dateSent: Date;

  @Column("timestamp with time zone", {
    name: "CreatedDate",
    default: () => "(now() AT TIME ZONE 'Asia/Manila')",
  })
  createdDate: Date;

  @Column("timestamp with time zone", { name: "UpdatedDate", nullable: true })
  updatedDate: Date | null;

  @Column("boolean", { name: "Active", default: () => "true" })
  active: boolean;

  @OneToMany(
    () => AnnouncementRecipient,
    (announcementRecipient) => announcementRecipient.announcement
  )
  announcementRecipients: AnnouncementRecipient[];

  @ManyToOne(() => Users, (users) => users.announcements)
  @JoinColumn([{ name: "CreatedByUserId", referencedColumnName: "userId" }])
  createdByUser: Users;

  @ManyToOne(() => Schools, (schools) => schools.announcements)
  @JoinColumn([{ name: "SchoolId", referencedColumnName: "schoolId" }])
  school: Schools;

  @ManyToOne(() => Users, (users) => users.announcements2)
  @JoinColumn([{ name: "UpdatedByUserId", referencedColumnName: "userId" }])
  updatedByUser: Users;
}
