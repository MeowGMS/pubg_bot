import { Utils } from '../Utils';
import { afterConfig, config } from '../Extends/config';
import { client, usersRep } from '../';
import { hideAndOpenAdr, hideAndOpenChannels, hideAndOpenRankeds } from './Extends/Utils';
import { Logs } from '../Utils/Logs';
import { InternalUtils } from '../Utils/Internal';

client.on('voiceStateUpdate', async (oldState, newState) => {
  const oldVC = oldState.channel;
  const newVC = newState.channel;
  const guild = newState.guild;
  const member = oldState.member || newState.member;

  if (!member) return;

  const formattedNick = member.displayName.replace(/\*/g, '');

  if (newVC?.parentID && !afterConfig.seekingIgnoreList.includes(newVC.parentID)) {
    member.setNickname(formattedNick + (newVC.members.size === 1 ? '*' : '')).catch((err) => {});
  }
  if (
    (oldVC?.parentID && !newVC && !afterConfig.seekingIgnoreList.includes(oldVC.parentID)) ||
    afterConfig.seekingIgnoreList.includes(newVC?.parentID)
  ) {
    member.setNickname(formattedNick).catch((err) => {});
  }

  if ((oldVC && newVC && oldVC.id !== newVC.id) || !newVC || !oldVC) {
    if (
      config.channels.voice.fppSquads.includes(oldVC?.parentID) ||
      config.channels.voice.fppSquads.includes(newVC?.parentID)
    ) {
      await hideAndOpenChannels(member, config.channels.voice.fppSquads);
    }

    if (
      config.channels.voice.duos.includes(oldVC?.parentID) ||
      config.channels.voice.duos.includes(newVC?.parentID)
    ) {
      await hideAndOpenChannels(member, config.channels.voice.duos);
    }

    if (
      config.channels.voice.tppSquads.includes(oldVC?.parentID) ||
      config.channels.voice.tppSquads.includes(newVC?.parentID)
    ) {
      await hideAndOpenChannels(member, config.channels.voice.tppSquads);
    }

    if (
      oldVC?.parentID === config.channels.category.ranked ||
      newVC?.parentID === config.channels.category.ranked
    ) {
      const oldVcName = oldVC?.name.split(/\s+/g);
      const newVcName = newVC?.name.split(/\s+/g);

      if (oldVcName === newVcName) {
        await hideAndOpenRankeds(member, oldVC);
      } else {
        if (oldVC) {
          await hideAndOpenRankeds(member, oldVC);
        }
        if (newVC) {
          await hideAndOpenRankeds(member, newVC);
        }
      }
    }

    if (
      oldVC?.parentID === config.channels.category.fppAdr ||
      newVC?.parentID === config.channels.category.fppAdr ||
      oldVC?.parentID === config.channels.category.tppAdr ||
      newVC?.parentID === config.channels.category.tppAdr
    ) {
      const oldVcName = oldVC?.name.substr(0, 11);
      const newVcName = newVC?.name.substr(0, 11);

      if (oldVcName === newVcName) {
        await hideAndOpenAdr(member, oldVC);
      } else {
        if (oldVC) {
          await hideAndOpenAdr(member, oldVC);
        }
        if (newVC) {
          await hideAndOpenAdr(member, newVC);
        }
      }
    }
  }

  if (guild.id === config.internal.workingGuild || guild.id === config.internal.workingGuild) {
    Logs.voiceMovements(oldVC, newVC, member);
  }

  if (newVC) {
    if (newVC.id === config.channels.voice.freeDuo) {
      await Utils.freeChannel(newVC, member, 'duos');
    } else if (newVC.id === config.channels.voice.freeFppSquad) {
      await Utils.freeChannel(newVC, member, 'fppSquads');
    } else if (newVC.id === config.channels.voice.freeTppSquad) {
      await Utils.freeChannel(newVC, member, 'tppSquads');
    }
  }

  if (!oldVC && newVC) {
    await Utils.updateSeekingEmbed(newVC, newVC, 'connect');

    if (newVC?.parentID === config.channels.category.premium && newVC?.members.size === 1) {
      await newVC.updateOverwrite(guild.id, {
        VIEW_CHANNEL: null,
      });
    }

    const userDb = await usersRep.findOne({
      discord_id: member.id,
    });

    if (userDb?.pubg_id) {
      await InternalUtils.queryAdd(member.id, userDb.game_nickname, 'voice');
    }
  } else if (oldVC && newVC && oldVC.id !== newVC.id) {
    if (oldVC.id !== newVC.id) await Utils.updateSeekingEmbed(oldVC, newVC, 'move');

    if (oldVC.parentID === config.channels.category.premium && oldVC.members.size === 0) {
      await oldVC.updateOverwrite(guild.id, {
        VIEW_CHANNEL: false,
      });
    }

    if (newVC.parentID === config.channels.category.premium && newVC.members.size === 1) {
      await newVC.updateOverwrite(guild.id, {
        VIEW_CHANNEL: null,
      });
    }
  } else if (oldVC && !newVC) {
    await Utils.updateSeekingEmbed(oldVC, oldVC, 'disconnect');

    if (oldVC.parentID === config.channels.category.premium && oldVC.members.size == 0) {
      await oldVC.updateOverwrite(guild.id, {
        VIEW_CHANNEL: false,
      });
    }
  }
});
