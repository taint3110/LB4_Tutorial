import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {configs} from './constant';
import dotenv from 'dotenv';
import path from "path"
dotenv.config({ path: path.join(__dirname, '../', '.env') })

const config = {
  name: 'database',
  connector: 'mongodb',
  url: configs.LOCAL_DB_URL,
  useNewUrlParser: true,
};

@lifeCycleObserver('datasource')
export class DatabaseDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'database';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.database', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
