import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DirectusMirrorService } from './directus.mirror.service'
import { DirectusProxyController } from './directus.proxy.controller'

@Module({
  imports: [ConfigModule],
  controllers: [DirectusProxyController],
  providers: [DirectusMirrorService],
  exports: [DirectusMirrorService]
})
export class DirectusModule {}
