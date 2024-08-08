import { Module } from "@nestjs/common";
import { ParentsController } from "./parents.controller";
import { Parents } from "src/db/entities/Parents";
import { ParentsService } from "src/services/parents.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";

@Module({
  imports: [FirebaseProviderModule, TypeOrmModule.forFeature([Parents])],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}
