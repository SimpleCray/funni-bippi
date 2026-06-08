import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RedisModule } from '@app/shared';
import { AuthModule } from './auth/auth.module';
import { GatewayModule } from './gateway/gateway.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    ServeStaticModule.forRoot({
      rootPath:
        process.env.UPLOAD_DIR ??
        (process.platform === 'win32' ? 'C:/tmp/uploads' : '/tmp/uploads'),
      serveRoot: '/files',
    }),
    AuthModule,
    GatewayModule,
    UploadModule,
  ],
})
export class AppModule {}
