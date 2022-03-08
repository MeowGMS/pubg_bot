import { config } from '../Extends/config';
import { client } from '../';
import { Logs } from '../Utils/Logs';
import { preventNickChanging } from './Extends/Utils';

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (newMember.guild.id !== config.internal.workingGuild) return;

  if (oldMember && newMember && oldMember.roles.cache.size !== newMember.roles.cache.size) {
    Logs.memberRolesUpdated(oldMember, newMember);
  }

  if (!oldMember || !newMember) return;

  preventNickChanging(oldMember, newMember);
});
