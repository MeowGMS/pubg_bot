import { config } from '../Extends/config';
import { client } from '../';
import { voiceActivitiesOnExit } from './Extends/Utils';
import { Logs } from '../Utils/Logs';

client.on('guildMemberRemove', async (member) => {
  if (member.guild.id !== config.internal.workingGuild) return;

  Logs.leaveGuild(member);
  voiceActivitiesOnExit(member);
});
