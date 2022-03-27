import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {configs} from './constant';
import dotenv from 'dotenv';
dotenv.config();
const config = {
  name: 'database',
  connector: 'mongodb',
  url: configs.MONGODB_URL,
  useNewUrlParser: true,
  roles: [ "readWrite", "dbAdmin" ]
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
