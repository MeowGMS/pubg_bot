import { config } from '../Extends/config';
import { client } from '../';
import { checkPunishmentsOnEnter, voiceActivitiesOnEnter } from './Extends/Utils';
import { Logs } from '../Utils/Logs';

client.on('guildMemberAdd', async (member) => {
  if (!member.guild) return;
  if (member.guild.id !== config.internal.workingGuild) return;

  checkPunishmentsOnEnter(member);
  Logs.enterGuild(member);
  voiceActivitiesOnEnter(member);
});
