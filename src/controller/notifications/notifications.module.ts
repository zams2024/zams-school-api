import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { Notifications } from "src/db/entities/Notifications";
import { NotificationsService } from "src/services/notifications.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PusherService } from "src/services/pusher.service";

@Module({
  imports: [TypeOrmModule.forFeature([Notifications])],
  controllers: [NotificationsController],
  providers: [NotificationsService, PusherService],
  exports: [NotificationsService, PusherService],
})
export class NotificationsModule {}
