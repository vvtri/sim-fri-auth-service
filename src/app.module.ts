import { Module, OnModuleInit } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from '@vvtri/nestjs-kafka';
import { AllExceptionsFilter } from 'common';
import firebase from 'firebase-admin';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { dataSource } from '../data-source';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import globalConfig, { GlobalConfig } from './common/configs/global.config';
import { consumerConfig, kafkaConfig } from './common/configs/kafka.config';
import { FileModule } from './file/file.module';
import { ProfileModule } from './profile/profile.module';
import { UtilModule } from './util/util.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => globalConfig],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({} as any),
      dataSourceFactory: async () => {
        initializeTransactionalContext();
        return addTransactionalDataSource(dataSource);
      },
    }),
    KafkaModule.forRoot({
      kafkaConfig,
      consumerConfig,
      shouldRunConsumerAsync: true,
    }),
    AuthModule,
    UtilModule,
    FileModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useValue: new ValidationPipe() },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private configService: ConfigService<GlobalConfig>) {}

  async onModuleInit() {
    firebase.initializeApp({
      credential: firebase.credential.cert({
        privateKey: this.configService
          .get<string>('firebase.privateKey')
          .replace(/\\n/gm, '\n'),
        clientEmail: this.configService.get('firebase.clientEmail'),
        projectId: this.configService.get('firebase.projectId'),
      } as Partial<firebase.ServiceAccount>),
    });
  }
}
