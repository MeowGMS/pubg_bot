import {
  client,
  kicksRep,
  premiumsRep,
  punishmentsRep,
  queryRep,
  reportsRep,
  seekingsRep,
  usersRep,
} from '../';
import {
  Guild,
  TextChannel,
  MessageEmbed,
  DMChannel,
  Message,
  CollectorFilter,
  GuildMember,
  VoiceChannel,
} from 'discord.js';
import { config, afterConfig } from '../Extends/config';
import { Utils } from './';
import { Connection, createConnection, LessThanOrEqual } from 'typeorm';
import { Punishment } from '../Entities/Punishment';
import { Report } from '../Entities/Report';
import { User } from '../Entities/User';
import { Kick } from '../Entities/Kick';
import { Premium } from '../Entities/Premium';
import { Seeking } from '../Entities/Seeking';
import { findPremRoleQuery } from './Premium';

import { QueryElement } from '../Entities/QueryElement';

import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';

type GenStatsEmbedArgs = {
  view: GameViews;
  gameNickname: string;
  embed: MessageEmbed;
  member: GuildMember;
  pubgData: PubgApiStatsData;
};

type AwaitReactionAndEditArgs = {
  message: Message;
  filter: CollectorFilter;
  embed: MessageEmbed;
  gameNickname: string;
  tppPubgData?: PubgApiStatsData;
  fppPubgData?: PubgApiStatsData;
  member: GuildMember;
  isRanked?: boolean;
};

export const InternalUtils = {
  hasPermission(member: GuildMember, canUseArr: string[]): boolean {
    const isAdmin = member.permissions.has('ADMINISTRATOR');
    return isAdmin || canUseArr.some((r) => member.roles.cache.has(r));
  },

  connectToDB(): Promise<Connection> {
    return createConnection({
      type: 'mariadb',
      host: '45.67.56.149',
      port: 3306,
      username: 'pubg_bot',
      charset: 'utf8mb4_unicode_ci',
      password: '9UoNJYiu2',
      database: 'pubg',
      synchronize: true,
      entities: [Kick, Premium, Punishment, Report, Seeking, User, QueryElement],
    });
  },

  fetchPremMessages(guild: Guild): void {
    const premCh = guild.channels.cache.get(config.channels.text.premiumMenu) as TextChannel;
    if (!premCh) return console.log('Меню Premium не получено: не найден канал');

    premCh.messages
      .fetch(config.messages.premium)
      .then(() => console.log('• Меню Premium получено'))
      .catch((err) => {});
    premCh.messages
      .fetch(config.messages.premiumPlus)
      .then(() => console.log('• Меню Premium+ получено'))
      .catch((err) => {});
  },

  async editEmbedContent(ch: TextChannel, seeking: Seeking, vc: VoiceChannel): Promise<void> {
    const message = await ch.messages.fetch(seeking.message).catch((err) => {});
    if (!message) {
      await seekingsRep.delete({
        voice_channel: vc.id,
      });
      return;
    }

    const oldEmbed = message.embeds[0];
    const matchView = oldEmbed.author.name.split(' • ')[1].toLowerCase().trim() as GameViews;
    const matchType = vc.userLimit === 2 ? 'duo' : 'squad';
    const infoArr = oldEmbed.author.name.split(' • ');
    const freeSlots = vc.userLimit - vc.members.size;
    const rankTxt = seeking.is_ranked ? 'Ranked' : '';

    infoArr[0] = vc.members.size >= vc.userLimit ? 'Играют' : `В поисках ${rankTxt} +${freeSlots}`;

    if (message.editedAt && message.editedTimestamp + 90 * 1000 < Date.now()) {
      await seekingsRep.delete({
        voice_channel: vc.id,
      });
    }

    const desc = await Utils.genLfgEmbedDesc({
      vc,
      matchType,
      inviteURL: seeking.invite,
      comment: seeking.comment,
      matchView,
    });

    const embed = new MessageEmbed()
      .setAuthor(infoArr.join(' • '), oldEmbed.author.iconURL)
      .setImage(config.images.invisible)
      .setDescription(desc)
      .setColor(Utils.colorGenerator(vc, matchView))
      .setThumbnail(Utils.thumbnailGenerator(vc, matchView, matchType, seeking.is_ranked))
      .setImage(config.images.invisible);

    const isFullChannel = vc.members.size >= vc.userLimit && vc.userLimit !== 0;
    const isAuthorInCh = !vc.members.find((m) => m.id === seeking.author);

    if (vc.members.size === 0 || (isFullChannel && isAuthorInCh)) {
      await seekingsRep.delete({
        voice_channel: vc.id,
      });

      await message.delete().catch((err) => {});
      return;
    }

    await message.edit(embed).catch((err) => {});
  },

  async punishCheck(guild: Guild) {
    const punishments = await punishmentsRep.find({
      where: {
        remove_date: LessThanOrEqual(new Date()),
      },
    });

    for (const punishment of punishments) {
      const member = await guild.members.fetch(punishment.discord_id).catch((err) => {});

      await punishmentsRep.delete(punishment).catch((err) => {});

      if (!member) return;

      switch (punishment.type) {
        case 'ban':
          await member.roles.remove(config.roles.ban).catch((err) => {});
          break;
        case 'mute':
          await member.roles.remove(config.roles.mute).catch((err) => {});
          break;
      }
    }
  },

  async clearFreeOverwrites(guild: Guild): Promise<void> {
    const clearOvs = async (type: 'freeDuo' | 'freeFppSquad' | 'freeTppSquad') => {
      const channel = guild.channels.cache.get(config.channels.voice[type]);
      if (channel) {
        const overwrites = channel.permissionOverwrites?.filter((p) => p.type === 'member');
        for (const [, ov] of overwrites) {
          await ov.delete().catch((err) => {});
        }

        console.log(
          `PermOverWrites Cleaner | Очищено ${overwrites.size} оверврайтов канала ${channel.name}`,
        );
      }
    };

    await clearOvs('freeDuo');
    await clearOvs('freeFppSquad');
    await clearOvs('freeTppSquad');
  },

  async premCheck(guild: Guild) {
    const premiums = await premiumsRep.find({
      where: {
        remove_date: LessThanOrEqual(new Date()),
      },
    });

    if (!premiums?.length) return;

    for (const premium of premiums) {
      const role = guild.roles.cache.get(premium.role_id);
      if (role) {
        const channel = guild.channels.cache.find((ch) => {
          const isPremCategory = ch.parentID === config.channels.category.premium;
          return ch.permissionOverwrites?.get(role.id) && isPremCategory;
        });

        await role.setName(role.name.split(' - ')[0] + ' - Свободно').catch(console.error);
        if (channel) {
          const firstRole = guild.roles.cache
            .filter(findPremRoleQuery)
            .sort((a, b) => b.position - a.position)
            .first();

          await channel
            .setName(`👑 Premium • ${firstRole.position - role.position + 1}`)
            .catch((err) => {});

          const otherPermsOv = channel.permissionOverwrites.filter((_) => _.type === 'member');
          for (const [, ov] of otherPermsOv) {
            await ov.delete().catch((err) => {});
          }
        } else if (channel) {
          await channel.setName(`👑 Premium • eto ban)`).catch((err) => {});
        }

        const member = await guild.members.fetch(premium.discord_id).catch((err) => {});
        if (member) {
          for (const toRemove of [config.roles.premium, role.id, config.roles.premiumPlus]) {
            await member.roles.remove(toRemove).catch((err) => {});
          }
        }

        await role.setColor('#000000');
      }

      console.log(`Prem Remover | Убрана роль с ${premium.discord_id}`);

      await premiumsRep.delete(premium).catch(console.error);
    }
  },

  async checkInactiveSeekings(guild: Guild) {
    const seekings = await seekingsRep.find();

    for (const seeking of seekings) {
      const ch = guild.channels.cache.get(seeking.msg_channel) as TextChannel;
      const vc = guild.channels.cache.get(seeking.voice_channel) as VoiceChannel;

      if (!ch) {
        await seekingsRep.delete(seeking);
        continue;
      }

      const message = await ch.messages.fetch(seeking.message).catch((err) => {});
      if (!message) {
        await seekingsRep.delete(seeking);
        continue;
      }

      if (seeking.last_bump?.getTime() + 5 * 60 * 1000 > Date.now()) continue;
      if (vc?.members.size >= 4) {
        await seekingsRep.delete(seeking);
        continue;
      }

      await message.delete().catch((err) => {});
      await seekingsRep.delete(seeking);
    }
  },

  async kicksCheck(guild: Guild) {
    const kicks = await kicksRep.find({
      where: {
        unpunish_date: LessThanOrEqual(new Date()),
      },
    });

    for (const kick of kicks) {
      const overChannel = guild.channels.cache.get(kick.voice_id);
      const overwrite = overChannel?.permissionOverwrites.get(kick.punish_id);

      if (overwrite) {
        await overwrite.delete().catch(console.error);
        console.log(
          `GameRoom Kicks (AfterReboot) | Запрет подключения удален у (ID: ${kick.punish_id})`,
        );
      }

      await kicksRep.delete(kick);
    }
  },

  async fetchReports(guild: Guild) {
    const reports = await reportsRep.find();
    if (!reports?.length) return;

    for (const report of reports) {
      const logChannel = guild.channels.cache.get(report.report_msg_channel) as TextChannel;
      if (!logChannel) {
        await reportsRep.delete(report).catch((err) => {});
        continue;
      }

      const reportMsg = await logChannel.messages.fetch(report.report_message).catch((err) => {});
      const dmChannel = client.channels.cache.get(report.dm_channel) as DMChannel;

      if (!reportMsg || !dmChannel) {
        await reportsRep.delete(report).catch((err) => {});
        continue;
      }

      const dmMsg = await dmChannel.messages.fetch(report.dm_message).catch((err) => {});
      if (!dmMsg) {
        await reportsRep.delete(report).catch((err) => {});
        continue;
      }

      console.log(`Report Fetching | Репорт ID: ${report.report_message} поднят`);
    }
  },

  async queryAdd(userID: string, gameNickname: string, updateType: QueryUpdateType) {
    const queryElement = await queryRep.findOne({
      user_id: userID,
    });
    const userDb = await usersRep.findOne({
      discord_id: userID,
    });

    if (queryElement?.update_priority >= config.consts.updatePriority[updateType]) return;

    if (queryElement?.update_priority < config.consts.updatePriority[updateType]) {
      await queryRep.delete(queryElement);
    }

    if (userDb?.last_query_update?.getTime() + config.timings.queryUpdateInterval > Date.now()) {
      return;
    }

    const newQueryElement = new QueryElement();

    newQueryElement.user_id = userID;
    newQueryElement.game_nickname = gameNickname;
    newQueryElement.update_type = updateType;
    newQueryElement.update_priority = config.consts.updatePriority[updateType];

    await queryRep.save(newQueryElement);
  },

  async queryMain(): Promise<void> {
    const voiceCount = await queryRep.count({
      update_type: 'voice',
    });

    const updateType = voiceCount > 0 ? 'voice' : 'auto';

    const currentElements = await queryRep.find({
      where: {
        update_type: updateType,
      },
      take: 10,
      order: {
        id: 'ASC',
      },
    });

    if (!currentElements?.length) {
      setTimeout(() => InternalUtils.queryMain(), config.timings.queryInterval);
      return;
    }
    const queryElement = currentElements[0];
    const userDb = await usersRep.findOne({
      discord_id: queryElement.user_id,
    });

    if (!userDb?.pubg_id) {
      await usersRep.update(
        {
          discord_id: queryElement.user_id,
        },
        {
          last_query_update: new Date(),
        },
      );

      await queryRep.delete(queryElement);

      setTimeout(() => InternalUtils.queryMain(), config.timings.queryInterval);
      return;
    }

    const fppRequestUrl = `https://api.pubg.com/shards/steam/players/${userDb.pubg_id}/seasons/${config.internal.offSeasonName}/ranked`;
    const fppPubgApiResponse = await axios
      .get(fppRequestUrl, {
        headers: {
          accept: 'application/vnd.api+json',
          Authorization: config.internal.pubgApiToken,
        },
      })
      .catch((err) => {});

    const tppRequestUrl = `https://api.pubg.com/shards/steam/players/${userDb.pubg_id}/seasons/${config.internal.offSeasonName}`;
    const tppPubgApiResponse = await axios
      .get(tppRequestUrl, {
        headers: {
          accept: 'application/vnd.api+json',
          Authorization: config.internal.pubgApiToken,
        },
      })
      .catch((err) => {});

    if (
      fppPubgApiResponse &&
      fppPubgApiResponse.status === 200 &&
      tppPubgApiResponse &&
      tppPubgApiResponse.status === 200
    ) {
      const fppPubgStatsData = fppPubgApiResponse.data.data;
      const tppPubgStatsData = tppPubgApiResponse.data.data;

      for (const view of ['tpp', 'fpp']) {
        for (const type of ['solo', 'duo', 'squad']) {
          await Utils.addPubgStats({
            matchType: type as GameMatchType,
            view: view as GameViews,
            gameNickname: queryElement.game_nickname,
            pubgStatsData: view === 'fpp' ? fppPubgStatsData : tppPubgStatsData,
          });
        }
      }

      await usersRep.update(
        {
          discord_id: queryElement.user_id,
        },
        {
          last_stats_update: new Date(),
          last_query_update: new Date(),
        },
      );
      await queryRep.delete(queryElement);
    }

    setTimeout(() => InternalUtils.queryMain(), config.timings.queryInterval);
  },

  async genPubgStatsEmbed(args: GenStatsEmbedArgs): Promise<MessageEmbed> {
    const { view, gameNickname, member, pubgData } = args;
    let { embed } = args;

    const userDb = await usersRep.findOne({
      game_nickname: gameNickname,
    });
    if (!userDb) return;

    embed.fields = [];
    embed.setDescription(`**${Utils.checkNicknameEquality(userDb, member)} • ${member.user}**`);
    embed.setColor(config.colors.gold);

    if (userDb.last_stats_update?.getTime() + 30 * 60 * 1000 > Date.now() || !pubgData) {
      for (const type of ['solo', 'duo', 'squad']) {
        embed = await Utils.addOldPubgStats({
          embed,
          matchType: type as GameMatchType,
          matchView: view,
          userDb,
        });
      }
    } else {
      for (const type of ['solo', 'duo', 'squad']) {
        embed = await Utils.addPubgStats({
          embed,
          matchType: type as GameMatchType,
          view: view,
          gameNickname,
          pubgStatsData: pubgData,
        });
      }
    }
    if (!embed.fields.length) {
      embed.addField(
        'PUBG • ' + view.toUpperCase(),
        `Похоже, что Вы не наиграли достатно игр, чтобы появиться на трекере ¯\\_(ツ)_/¯`,
      );
    }

    return embed;
  },

  async awaitReactionAndEdit(args: AwaitReactionAndEditArgs): Promise<void> {
    const { message, filter, gameNickname, tppPubgData, fppPubgData, member } = args;
    let { embed } = args;

    const collected = await message
      .awaitReactions(filter, {
        time: 20000,
        maxEmojis: 1,
        maxUsers: 1,
      })
      .catch((err) => {});

    const collectedEmojiID = collected ? collected.first()?.emoji?.id : null;

    if (!collectedEmojiID) {
      message.reactions.removeAll().catch((err) => {});
      return;
    }

    for (const updateReact of afterConfig.allUpdateReactions) {
      if (updateReact === collectedEmojiID) continue;
      await message.react(client.emojis.cache.get(updateReact)).catch((err) => {});
    }

    switch (collectedEmojiID) {
      case config.emojis.fpp:
        {
          const resEmbed = await InternalUtils.genPubgStatsEmbed({
            view: 'fpp',
            member,
            embed,
            gameNickname,
            pubgData: fppPubgData,
          });

          await message.edit(resEmbed).catch((err) => {});

          await InternalUtils.awaitReactionAndEdit({
            message,
            filter,
            embed: resEmbed,
            gameNickname,
            fppPubgData,
            tppPubgData,
            member,
          });
        }
        break;
      case config.emojis.tpp:
        {
          const resEmbed = await InternalUtils.genPubgStatsEmbed({
            view: 'tpp',
            member,
            embed,
            gameNickname,
            pubgData: tppPubgData,
          });

          await message.edit(resEmbed).catch((err) => {});

          await InternalUtils.awaitReactionAndEdit({
            message,
            filter,
            embed: resEmbed,
            gameNickname,
            tppPubgData,
            fppPubgData,
            member,
          });
        }
        break;
    }
  },

  updateBanner: async (guild: Guild): Promise<void> => {
    const image = await loadImage('banner.png').catch(console.error);
    if (!image) return;

    const canvas = createCanvas(960, 540);
    const ctx = canvas.getContext('2d');

    const voiceMembers = guild.members.cache.filter((_) => Boolean(_.voice.channel)).size;
    const guildMembers = guild.memberCount;

    const voiceText = voiceMembers.toString();
    const membersText = guildMembers.toString();

    const voiceX =
      config.internal.bannerX.voice[voiceMembers.toString().length] ??
      config.internal.bannerX.voice.default;
    const membersX =
      config.internal.bannerX.members[guildMembers.toString().length] ??
      config.internal.bannerX.members.default;

    const voiceY = 380;
    const membersY = 460;

    ctx.drawImage(image, 0, 0);

    ctx.shadowColor = '#5b5b5b';

    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.font = '45px Sora SemiBold';
    ctx.fillStyle = 'white';

    ctx.fillText(voiceText, voiceX, voiceY);
    ctx.fillText(membersText, membersX, membersY);

    await guild.setBanner(canvas.toBuffer()).catch(console.error);
  },
};
