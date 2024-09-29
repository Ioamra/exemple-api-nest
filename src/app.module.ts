import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserAccountModule } from './modules/core/user_account/user_account.module';
import { AuthModule } from './modules/core/auth/auth.module';

@Module({
  imports: [CommonModule, UserAccountModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
