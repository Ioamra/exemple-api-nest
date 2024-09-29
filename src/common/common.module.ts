import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountModule } from '../modules/core/user_account/user_account.module';
import { GeneratePostManCollectionService } from './services/generatePostmanCollection.service';
import { GetJwtInfoService } from './services/getJwtInfo.service';
import { MailService } from './services/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([], { type: 'postgres', synchronize: false }), JwtModule, UserAccountModule],
  providers: [MailService, GetJwtInfoService, GeneratePostManCollectionService],
  exports: [MailService, GetJwtInfoService],
})
export class CommonModule {}
