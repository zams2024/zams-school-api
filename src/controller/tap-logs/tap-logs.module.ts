import { Module } from "@nestjs/common";
import { TapLogsController } from "./tap-logs.controller";
import { TapLogs } from "src/db/entities/TapLogs";
import { TapLogsService } from "src/services/tap-logs.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";
import { PusherService } from "src/services/pusher.service";
import { FirebaseCloudMessagingService } from "src/services/firebase-cloud-messaging.service";
import { HttpModule } from "@nestjs/axios";
import { OneSignalNotificationService } from "src/services/one-signal-notification.service";

@Module({
  imports: [
    FirebaseProviderModule,
    HttpModule,
    TypeOrmModule.forFeature([TapLogs]),
  ],
  controllers: [TapLogsController],
  providers: [
    TapLogsService,
    PusherService,
    FirebaseCloudMessagingService,
    OneSignalNotificationService,
  ],
  exports: [
    TapLogsService,
    PusherService,
    FirebaseCloudMessagingService,
    OneSignalNotificationService,
  ],
})
export class TapLogsModule {}
