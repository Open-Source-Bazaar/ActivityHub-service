import { ConnectionOptions, parse } from 'pg-connection-string';
import { DataSource } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { DATABASE_URL, isProduct } from '../utility';
import { Activity, Agenda, CheckEvent, Cooperation, Session } from './Activity';
import { Membership, Organization, Place } from './Organization';
import { Tag } from './Tag';
import { ActivityLog, User, UserCredential } from './User';

export * from './Activity';
export * from './Base';
export * from './File';
export * from './Organization';
export * from './Tag';
export * from './User';

const { ssl, host, port, user, password, database } = isProduct
    ? parse(DATABASE_URL)
    : ({} as ConnectionOptions);

const entities = [
    User,
    UserCredential,
    ActivityLog,
    Tag,
    Place,
    Organization,
    Membership,
    Activity,
    Cooperation,
    Session,
    Agenda,
    CheckEvent
];

const commonOptions: Pick<
    SqliteConnectionOptions,
    'logging' | 'synchronize' | 'entities' | 'migrations'
> = {
    logging: true,
    synchronize: true,
    entities,
    migrations: [`${isProduct ? '.data' : 'migration'}/*.ts`]
};

export const dataSource = isProduct
    ? new DataSource({
          type: 'postgres',
          ssl: ssl as boolean,
          host,
          port: +port,
          username: user,
          password,
          database,
          ...commonOptions
      })
    : new DataSource({
          type: 'better-sqlite3',
          database: '.data/test.db',
          ...commonOptions
      });
