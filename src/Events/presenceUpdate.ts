import { afterConfig, config } from '../Extends/config';
import { client, usersRep } from '../';
import { InternalUtils } from '../Utils/Internal';

client.on('presenceUpdate', async (oldPresence, newPresence) => {
  const newStreamActivity = newPresence?.activities.find((act) => act.type === 'STREAMING');
  // const oldStreamActivity = oldPresence?.activities?.find((act) => act.type === 'STREAMING');

  const member = oldPresence?.member || newPresence?.member;
  if (!member) return;

  if (
    newStreamActivity &&
    member.guild.id === config.internal.workingGuild &&
    afterConfig.liveStreamRoles.some((_) => member.roles.cache.has(_)) &&
    !member.roles.cache.has(config.roles.liveStream)
  ) {
    await member.roles.add(config.roles.liveStream).catch(console.error);
  }

  if (
    !newStreamActivity &&
    member.guild.id === config.internal.workingGuild &&
    member.roles.cache.has(config.roles.liveStream)
  ) {
    await member.roles.remove(config.roles.liveStream).catch(console.error);
  }

  if (oldPresence?.status === 'offline' && newPresence?.status !== 'offline') {
    const userDb = await usersRep.findOne({
      discord_id: member.id,
    });
    if (userDb?.pubg_id) {
      await InternalUtils.queryAdd(member.id, userDb.game_nickname, 'voice');
    }
  }
});
