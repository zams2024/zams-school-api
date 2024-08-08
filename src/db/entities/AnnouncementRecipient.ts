import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Announcements } from "./Announcements";

@Index(
  "AnnouncementRecipient_pkey",
  ["announcementId", "groupReferenceId", "type"],
  { unique: true }
)
@Entity("AnnouncementRecipient", { schema: "dbo" })
export class AnnouncementRecipient {
  @Column("bigint", { primary: true, name: "AnnouncementId" })
  announcementId: string;

  @Column("character varying", { primary: true, name: "Type" })
  type: string;

  @Column("bigint", { primary: true, name: "GroupReferenceId" })
  groupReferenceId: string;

  @Column("int8", { name: "ExcludedIds", nullable: true, array: true })
  excludedIds: string[] | null;

  @ManyToOne(
    () => Announcements,
    (announcements) => announcements.announcementRecipients
  )
  @JoinColumn([
    { name: "AnnouncementId", referencedColumnName: "announcementId" },
  ])
  announcement: Announcements;
}
