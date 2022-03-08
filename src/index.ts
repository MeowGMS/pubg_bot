import { config } from './Extends/config';
import { MyClient } from './MyClient';
import { InternalUtils } from './Utils/Internal';

import { Punishment } from './Entities/Punishment';
import { Report } from './Entities/Report';
import { User } from './Entities/User';
import { Kick } from './Entities/Kick';
import { Seeking } from './Entities/Seeking';
import { Premium } from './Entities/Premium';
import { QueryElement } from './Entities/QueryElement';
import { Connection, Repository } from 'typeorm';

export let connection: Connection,
  client: MyClient,
  punishmentsRep: Repository<Punishment>,
  reportsRep: Repository<Report>,
  usersRep: Repository<User>,
  kicksRep: Repository<Kick>,
  seekingsRep: Repository<Seeking>,
  premiumsRep: Repository<Premium>,
  queryRep: Repository<QueryElement>;

async function start() {
  connection = await InternalUtils.connectToDB();
  punishmentsRep = connection.getRepository(Punishment);
  reportsRep = connection.getRepository(Report);
  usersRep = connection.getRepository(User);
  kicksRep = connection.getRepository(Kick);
  seekingsRep = connection.getRepository(Seeking);
  premiumsRep = connection.getRepository(Premium);
  queryRep = connection.getRepository(QueryElement);

  client = new MyClient();

  client.login(config.internal.discordAuth);
}

start();
