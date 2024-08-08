import { Module } from "@nestjs/common";
import { LinkStudentRequestController } from "./link-student-request.controller";
import { LinkStudentRequestService } from "src/services/link-student-request.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LinkStudentRequest } from "src/db/entities/LinkStudentRequest";
import { PusherService } from "src/services/pusher.service";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";
import { OneSignalNotificationService } from "src/services/one-signal-notification.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    FirebaseProviderModule,
    HttpModule,
    TypeOrmModule.forFeature([LinkStudentRequest]),
  ],
  controllers: [LinkStudentRequestController],
  providers: [
    LinkStudentRequestService,
    PusherService,
    OneSignalNotificationService,
  ],
  exports: [
    LinkStudentRequestService,
    PusherService,
    OneSignalNotificationService,
  ],
})
export class LinkStudentRequestModule {}
