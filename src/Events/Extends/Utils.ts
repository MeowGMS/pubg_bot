import {
  CategoryChannel,
  Collection,
  GuildChannel,
  GuildMember,
  MessageEmbed,
  MessageReaction,
  PartialGuildMember,
  PartialUser,
  User,
  VoiceChannel,
} from 'discord.js';
import { client, punishmentsRep, reportsRep } from '../../';
import { MoreThan } from 'typeorm';
import { afterConfig, config } from '../../Extends/config';
import { Utils } from '../../Utils';

export const checkPunishmentsOnEnter = async (member: GuildMember): Promise<void> => {
  const results = await punishmentsRep.find({
    where: {
      discord_id: member.id,
      remove_date: MoreThan(new Date()),
    },
  });

  for (const result of results) {
    switch (result.type) {
      case 'ban':
        await member.roles.add(config.roles.ban).catch(console.error);
        break;
      case 'mute':
        await member.roles.add(config.roles.mute).catch(console.error);
        break;
    }
  }
};

export const voiceActivitiesOnEnter = async (member: GuildMember): Promise<void> => {
  const vc = member.voice.channel;
  if (!vc) return;

  if (vc.id === config.channels.voice.freeDuo) {
    await Utils.freeChannel(vc, member, 'duos');
  } else if (vc.id === config.channels.voice.freeFppSquad) {
    await Utils.freeChannel(vc, member, 'fppSquads');
  } else if (vc.id === config.channels.voice.freeTppSquad) {
    await Utils.freeChannel(vc, member, 'tppSquads');
  }
  if (config.channels.voice.fppSquads.includes(vc.parentID)) {
    await hideAndOpenChannels(member, config.channels.voice.fppSquads);
  }

  if (config.channels.voice.tppSquads.includes(vc.parentID)) {
    await hideAndOpenChannels(member, config.channels.voice.tppSquads);
  }

  if (config.channels.voice.duos.includes(vc.parentID)) {
    await hideAndOpenChannels(member, config.channels.voice.duos);
  }

  await Utils.updateSeekingEmbed(vc, vc, 'connect');

  if (vc.parentID == config.channels.category.premium && vc.members.size == 1) {
    await vc.updateOverwrite(member.guild.id, {
      VIEW_CHANNEL: null,
    });
  }
};

export const voiceActivitiesOnExit = async (
  member: GuildMember | PartialGuildMember,
): Promise<void> => {
  const vc = member.voice.channel;

  if (vc) {
    if (vc && config.channels.voice.fppSquads.includes(vc.parentID)) {
      await hideAndOpenChannels(member, config.channels.voice.fppSquads);
    }

    if (vc && config.channels.voice.tppSquads.includes(vc.parentID)) {
      await hideAndOpenChannels(member, config.channels.voice.tppSquads);
    }

    if (vc && config.channels.voice.duos.includes(vc.parentID)) {
      await hideAndOpenChannels(member, config.channels.voice.duos);
    }

    await Utils.updateSeekingEmbed(vc, vc, 'disconnect');

    if (vc.parentID == config.channels.category.premium && vc.members.size == 0) {
      await member.voice.channel.updateOverwrite(member.guild.id, {
        VIEW_CHANNEL: false,
      });
    }
  }
};

export const hideAndOpenAdr = async (
  member: GuildMember | PartialGuildMember,
  vc: VoiceChannel,
): Promise<void> => {
  if (!vc.parentID) return;

  const nameArr = vc.name.split(/\s+/g);
  const view = nameArr[0];
  const adr = nameArr[2];

  const regExp = new RegExp(`^${view} ADR ${parseInt(adr)}\\+ # \\d{1,2}`, '');

  const freeChannels = vc.parent.children
    .filter((ch) => regExp.test(ch.name) && ch.members.size === 0)
    .sort((a, b) => a.position - b.position);

  const firstToOpen = freeChannels.first();

  if (firstToOpen) {
    await firstToOpen
      .updateOverwrite(member.guild.id, {
        VIEW_CHANNEL: null,
      })
      .catch(console.error);
  }

  const channelsToHide = freeChannels.filter((vc: VoiceChannel) => {
    const isToOpen = firstToOpen ? firstToOpen.id === vc.id : false;
    const overwrite = vc.permissionOverwrites.get(member.guild.id);

    return (
      !isToOpen &&
      (!overwrite || (!overwrite.allow.has('VIEW_CHANNEL') && !overwrite.deny.has('VIEW_CHANNEL')))
    );
  });

  for (const [, channel] of channelsToHide) {
    await channel
      .updateOverwrite(member.guild.id, {
        VIEW_CHANNEL: false,
      })
      .catch(console.error);
  }
};

export const hideAndOpenRankeds = async (
  member: GuildMember | PartialGuildMember,
  vc: VoiceChannel,
): Promise<void> => {
  if (!vc.parentID) return;

  const nameArr = vc.name.split(/\s+/g);
  const rank = nameArr[0];

  const regExp = new RegExp(`^${rank} # \\d{1,2}`, '');

  const freeChannels = vc.parent.children
    .filter((ch) => regExp.test(ch.name) && ch.members.size === 0)
    .sort((a, b) => a.position - b.position);

  const firstToOpen = freeChannels.first();

  if (firstToOpen) {
    await firstToOpen
      .updateOverwrite(member.guild.id, {
        VIEW_CHANNEL: null,
      })
      .catch(console.error);
  }

  const channelsToHide = freeChannels.filter((vc: VoiceChannel) => {
    const isToOpen = firstToOpen ? firstToOpen.id === vc.id : false;
    const overwrite = vc.permissionOverwrites.get(member.guild.id);

    return (
      !isToOpen &&
      (!overwrite || (!overwrite.allow.has('VIEW_CHANNEL') && !overwrite.deny.has('VIEW_CHANNEL')))
    );
  });

  for (const [, channel] of channelsToHide) {
    await channel
      .updateOverwrite(member.guild.id, {
        VIEW_CHANNEL: false,
      })
      .catch(console.error);
  }
};

export const hideAndOpenChannels = async (
  member: GuildMember | PartialGuildMember,
  ids: string[],
): Promise<void> => {
  const channels = ids.reduce((acc, currID) => {
    const category = member.guild.channels.cache.get(currID) as CategoryChannel;
    if (!category || category.type !== 'category') return acc;

    acc = acc.concat(category.children.sort((a, b) => a.position - b.position));

    return acc;
  }, new Collection<string, GuildChannel>());

  const freeChannels = channels.filter((_: VoiceChannel) => _.members.size === 0);
  const isDuo = channels.find((ch) => ch.name.toLowerCase().includes('duo'));
  const isTpp = channels.find((ch) => ch.name.toLowerCase().includes('tpp'));

  const channelsToOpen = freeChannels.first(
    isDuo || isTpp ? config.consts.freeDuoChannels : config.consts.freeChannels,
  );
  const filteredToOpen = channelsToOpen.filter((ch: VoiceChannel) =>
    ch.permissionOverwrites.get(member.guild.id)?.deny.has('VIEW_CHANNEL'),
  );

  for (const channel of filteredToOpen) {
    await channel
      .updateOverwrite(member.guild.id, {
        VIEW_CHANNEL: null,
      })
      .catch(console.error);
  }

  const channelsToHide = freeChannels.filter((vc: VoiceChannel) => {
    const isVcInToOpenList = channelsToOpen.find((ch) => ch.id === vc.id);
    const overwrite = vc.permissionOverwrites.get(member.guild.id);

    return (
      !isVcInToOpenList &&
      (!overwrite || (!overwrite.allow.has('VIEW_CHANNEL') && !overwrite.deny.has('VIEW_CHANNEL')))
    );
  });

  for (const [, channel] of channelsToHide) {
    await channel
      .updateOverwrite(member.guild.id, {
        VIEW_CHANNEL: false,
      })
      .catch(console.error);
  }
};

export const preventNickChanging = (
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember,
): void => {
  const oldNick = oldMember.nickname;
  const newNick = newMember.nickname;

  if (oldNick === newNick) return;

  const clearNick = oldMember.displayName.replace(/\*/g, '');
  const isInGaming = afterConfig.seekingIgnoreList.includes(newMember.voice.channel?.parentID);

  if (oldNick?.includes('*') && newNick && !newNick.includes('*') && isInGaming) {
    newMember
      .setNickname(clearNick ?? `Member ${Math.floor(Math.random() * 10000)}`)
      .catch(console.error);
  }
};

export const reportReactionsHandler = async (
  r: MessageReaction,
  user: User | PartialUser,
): Promise<void> => {
  const { emoji, message } = r;
  const isAccepted = emoji.id === config.emojis.checkmark;

  const report = await reportsRep.findOne({
    report_message: message.id,
  });

  if (!report) return;

  const reportCh = client.channels.cache.get(report.report_msg_channel);
  const reportAuthor = await client.users.fetch(report.author).catch((err) => {});

  if (!reportCh || !reportAuthor) {
    reportsRep
      .delete({
        report_message: message.id,
      })
      .catch(console.error);
    return;
  }

  const dm = await reportAuthor.createDM().catch((err) => {});

  if (dm) {
    const formReason = report.reason.slice(0, 40) + (report.reason.length > 40 ? '...' : '');
    const modReaction = isAccepted ? 'дан положительный ответ. Спасибо за помощь' : 'отклонён';

    await dm
      .send(`${isAccepted ? 'На ' : ''}Ваш репорт (${formReason}) был ${modReaction}`)
      .catch(console.error)
      .then(() =>
        message.react(client.emojis.cache.get(config.emojis.telegram)).catch((err) => {}),
      );
  }

  await reportsRep.delete(report);
  await message
    .edit({
      embed: new MessageEmbed(message.embeds[0])
        .setColor(isAccepted ? '#2ecc71' : 'RED')
        .setTitle(isAccepted ? 'Одобрено' : 'Отклонено'),
    })
    .catch(console.error);

  await message.reactions.removeAll();
  await message.react(client.emojis.cache.get(config.emojis.checkmark)).catch((err) => {});
};
