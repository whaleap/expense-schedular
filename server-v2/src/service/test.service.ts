import { DatabaseConfig } from '@config/DatabaseConfig';
import { AppConfig } from '@config/appConfig';
import { TestConfig } from '@config/testConfig';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
@Injectable()
export class TestService {
  constructor(
    @Inject(AppConfig.KEY) private appConfig: ConfigType<typeof AppConfig>,
    @Inject(TestConfig.KEY) private testConfig: ConfigType<typeof TestConfig>,
    @Inject(DatabaseConfig.KEY)
    private dbConfig: ConfigType<typeof DatabaseConfig>,
  ) {}

  getHello(): string {
    return 'hello';
  }

  getConfig(): object {
    return {
      app: this.appConfig,
      testConfig: this.testConfig,
      dbConfig: this.dbConfig,
    };
  }
}
