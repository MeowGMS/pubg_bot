import {
  CategoryChannel,
  Collection,
  GuildChannel,
  GuildMember,
  Message,
  MessageEmbed,
  Role,
  TextChannel,
  VoiceChannel,
} from 'discord.js';
import { client, punishmentsRep, seekingsRep, usersRep } from '../';
import { afterConfig, config } from '../Extends/config';
import { Punishment } from '../Entities/Punishment';
import { User as UserDB } from '../Entities/User';
import { InternalUtils } from './Internal';

type FreeChannelsType = 'duos' | 'fppSquads' | 'tppSquads';

type GenLfgEmbedDescArgs = {
  vc: VoiceChannel;
  matchView: GameViews;
  matchType: GameMatchType;
  comment: string;
  inviteURL: string;
};

type AddOldPubgStatsArgs = {
  embed: MessageEmbed;
  matchType: GameMatchType;
  matchView: GameViews;
  userDb: UserDB;
};

type CheckStatsRoleArgs = {
  member: GuildMember;
  kd: number;
  adr: number;
  wr: number;
  view: GameViews;
  rankInfo?: string;
};

type CheckRolesArgs = {
  member: GuildMember;
  regexp: RegExp;
  statsName: 'adr' | 'kd' | 'wr';
  statsValue: number;
};

type AddMemberInfoArgs = {
  memberObj: {
    id: string;
    nickname: string;
    username: string;
  };
  matchView: GameViews;
  matchType: GameMatchType;
  vc: VoiceChannel;
  fullChannel?: boolean;
};

type AddPubgStatsArgs = {
  embed?: MessageEmbed;
  matchType: GameMatchType;
  view: GameViews;
  gameNickname: string;
  pubgStatsData: PubgApiStatsData;
};

export const Utils = {
  thumbnailGenerator(
    vc: VoiceChannel,
    matchView: GameViews,
    matchType: GameMatchType,
    isRanked = false,
  ): string {
    const freeSlots = vc.userLimit - vc.members.size;
    if (freeSlots <= 0) return config.images.full;

    const normalizedView = (isRanked ? 'ranked_' : '') + matchView;

    if (vc.members.find((m) => m.roles.cache.has(config.roles.premium))) {
      return config.images.premium[normalizedView][freeSlots];
    }

    if (
      vc.parentID === config.channels.category.fppAdr ||
      vc.parentID === config.channels.category.tppAdr
    ) {
      const view = vc.name.split(/\s+/g)[0].toLowerCase();
      const adr = vc.name.split(/\s+/g)[2].replace('+', '');
      return config.images.adr[view][adr][freeSlots];
    }

    return config.images[normalizedView][matchType === 'duo' ? '2' : '4'][freeSlots];
  },

  colorGenerator(vc: VoiceChannel, matchView: GameViews): string {
    if (vc.userLimit <= vc.members.size) return config.colors.full;

    if (vc.members.find((_) => _.roles.cache.has(config.roles.premium))) {
      return vc.guild.roles.cache.get(config.roles.premium).hexColor;
    }

    switch (vc.parentID) {
      case config.channels.category.tppAdr:
      case config.channels.category.fppAdr:
        return '#e22828';
    }

    if (matchView === 'fpp') {
      return '#3398CE';
    } else {
      return '#34FF2F';
    }
  },

  dmHandler(message: Message) {
    if (message.author.id === client.user.id) return;

    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setTitle(`**Содержание сообщения**`)
      .setDescription(
        message.content.length > 0 ? `\`\`${message.content.slice(0, 600)}\`\`` : '*[Пусто]*',
      )
      .setFooter(`ID: ${message.author.id}`)
      .setTimestamp();

    if (message.attachments.size > 0) embed.setImage(message.attachments.first().proxyURL);

    const logChannel = client.channels.cache.get(config.channels.text.dmLogs) as TextChannel;
    if (logChannel) {
      logChannel
        .send(message.author, {
          embed,
        })
        .catch((err) => {});
    }
  },

  getNormalDate: function (timestamp: number, withOutTime?: boolean) {
    const date = new Date(timestamp);
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const d = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const dateStr = `${d < 10 ? '0' + d : d}.${month < 10 ? '0' + month : month}.${year}`;
    const timeStr = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s} `;

    return (withOutTime ? '' : timeStr) + dateStr;
  },

  getNormalTime(ts: number, argsCount = 4): string {
    const argsArr: string[] = [];

    const days = ts / (1000 * 60 * 60 * 24);
    const absoluteDays = Math.floor(days);

    const hours = (days - absoluteDays) * 24;
    const absoluteHours = Math.floor(hours);

    const mins = (hours - absoluteHours) * 60;
    const absoluteMins = Math.floor(mins);

    const secs = (mins - absoluteMins) * 60;
    const absoluteSecs = Math.floor(secs);

    if (absoluteDays !== 0) argsArr.push(absoluteDays + ' дн.');
    if (absoluteHours !== 0) argsArr.push(absoluteHours + ' ч.');
    if (absoluteMins !== 0) argsArr.push(absoluteMins + ' мин.');
    if (absoluteSecs !== 0) argsArr.push(absoluteSecs + ' сек.');

    const diff = argsArr.length - argsCount;

    if (argsArr.length > argsCount) argsArr.splice(-diff, diff);

    return argsArr.join('  ');
  },

  checkNicknameEquality(userInfo: UserDB | string, member: GuildMember, vc?: VoiceChannel): string {
    if (!userInfo) return client.emojis.cache.get(config.emojis.noRegistration).toString();

    const { cache } = client.emojis;
    const { emojis } = config;

    const gameNickname = typeof userInfo === 'string' ? userInfo : userInfo.game_nickname;
    const isSameNickname = member.nickname && gameNickname === member.nickname;
    const isSameUsername = !member.nickname && gameNickname === member.user.username;
    const isChannelFull = vc?.members.size >= vc?.userLimit;
    const emoji = isChannelFull
      ? cache.get(emojis.sameNicknameOff)
      : cache.get(emojis.sameNickname);

    if (isSameNickname || isSameUsername) {
      return `[${gameNickname}${emoji}](https://pubg.op.gg/user/${gameNickname})`;
    }

    const regEmoji = isChannelFull
      ? cache.get(config.emojis.infoRegisteredOff)
      : cache.get(config.emojis.infoRegistered);

    return `[${gameNickname}${regEmoji}](https://pubg.op.gg/user/${gameNickname})`;
  },

  timePostfixConverting(punishTime: string): number {
    const replaced = punishTime.replace(/[0-9]+/g, '');
    if (!replaced) return 5 * 60 * 1000;

    switch (replaced) {
      case 'мес':
      case 'mon':
        return parseInt(punishTime, 10) * 31 * 24 * 60 * 60 * 1000;
      case 'd':
      case 'д':
        return parseInt(punishTime, 10) * 24 * 60 * 60 * 1000;
      case 'h':
      case 'ч':
        return parseInt(punishTime, 10) * 60 * 60 * 1000;
      case 'm':
      case 'м':
      default:
        return parseInt(punishTime, 10) * 60 * 1000;
    }
  },

  async freeChannel(vc: VoiceChannel, member: GuildMember, type: FreeChannelsType): Promise<void> {
    const freeChannels = config.channels.voice[type].reduce((acc, curr) => {
      const category = member.guild.channels.cache.get(curr) as CategoryChannel;
      if (!category) return acc;

      acc = acc.concat(
        category.children
          .filter((ch: VoiceChannel) => ch.members.size === 0)
          .sort((a, b) => a.position - b.position),
      );

      return acc;
    }, new Collection<string, GuildChannel>());

    const freeCh = freeChannels.first();

    await member.voice.setChannel(freeCh ?? null).catch((err) => {});

    const ov = await vc
      .updateOverwrite(member.id, {
        CONNECT: false,
      })
      .catch((err) => {});

    if (!ov) return;

    setTimeout(() => vc?.permissionOverwrites?.get(member.id)?.delete(), 60 * 1000);
  },

  async sendToMsgChannel(message: Message, error_text: string) {
    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setTitle(error_text)
      .setColor('RED');

    message.channel
      .send(embed)
      .then(async (m) => {
        await m.delete({ timeout: config.timings.errorAutodelete }).catch((err) => {});
        await message.delete().catch((err) => {});
      })
      .catch((err) => {});
  },

  async sendToMsgChannel_desc(message: Message, errorText: string) {
    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(errorText)
      .setColor('RED');

    const sent = await message.channel.send(embed).catch((err) => {});
    if (sent) await sent.delete({ timeout: config.timings.errorAutodelete }).catch((err) => {});

    await message.delete().catch((err) => {});
  },

  async sendToAuthor(message: Message, errorText: string) {
    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setTitle(errorText)
      .setColor('RED');

    const sent = await message.author.send(embed).catch((err) => {});
    if (sent) await sent.delete({ timeout: config.timings.errorAutodelete }).catch((err) => {});

    await message.delete().catch((err) => {});
  },

  async sendToAuthorDesc(message: Message, errorText: string) {
    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(errorText)
      .setColor('RED');

    const sent = await message.author.send(embed).catch((err) => {});
    if (sent) await sent.delete({ timeout: config.timings.errorAutodelete }).catch((err) => {});

    await message.delete().catch((err) => {});
  },

  async createPunishment(userID: string, type: PunishmentTypes, punishTime: number) {
    const punishment = new Punishment();

    punishment.discord_id = userID;
    punishment.remove_date = new Date(Date.now() + punishTime);
    punishment.type = type;

    return punishmentsRep.save(punishment);
  },

  async checkRoles(args: CheckRolesArgs): Promise<void> {
    const { member, regexp, statsName, statsValue } = args;

    let role: Role;
    const rolesArr = member.guild.roles.cache
      .filter((r) => regexp.test(r.name.toLowerCase()))
      .map((r) => {
        const replacedName = r.name.replace(/[^.0-9]+/g, '');
        const val =
          statsName === 'adr' || statsName === 'wr'
            ? parseInt(replacedName)
            : parseFloat(replacedName);

        return {
          id: r.id,
          adr: val,
          kd: val,
          wr: val,
        };
      })
      .sort((a, b) => b[statsName] - a[statsName]);

    const minStatsValues = {
      kd: 1,
      adr: 100,
      wr: 5,
    };

    if (statsValue >= minStatsValues[statsName]) {
      const statsObj = rolesArr.find(
        (_, i, arr) =>
          statsValue >= _[statsName] && (!arr[i - 1] || arr[i - 1][statsName] > statsValue),
      );

      role = member.guild.roles.cache.get(statsObj?.id);

      if (role && !member.roles.cache.has(role.id)) await member.roles.add(role).catch((err) => {});
    }

    const filterToRemoveQuery = (r: Role): boolean => {
      return rolesArr.find((arr) => arr.id === r.id) && (role ? r.id !== role.id : true);
    };

    const rolesToRemove = member.roles.cache.filter(filterToRemoveQuery);

    for (const toRemove of rolesToRemove) {
      await member.roles.remove(toRemove).catch((err) => {});
    }
  },

  async checkStatsRoles(args: CheckStatsRoleArgs) {
    const { member, kd = 0, adr = 0, wr = 0, view, rankInfo } = args;

    const kdRegexp = new RegExp(`^${view} kd \\d{1,2}(.\\d{1,2})?\\+`, '');
    const adrRegexp = new RegExp(`^${view} adr \\d{1,3}(\\+)?`, '');
    const wrRegexp = new RegExp(`^${view} wr \\d{1,3}%(\\+)?`, '');

    const statsRole = member.guild.roles.cache.get(config.roles.stats);
    if (statsRole && !member.roles.cache.has(statsRole.id)) {
      await member.roles.add(config.roles.stats).catch((err) => {});
    }

    if (rankInfo && view === 'fpp') {
      const normInfo = rankInfo.toLowerCase() === 'master 1' ? 'master' : rankInfo.toLowerCase();
      const rankRole = member.guild.roles.cache.find((r) => r.name.toLowerCase() === normInfo);

      if (rankRole) await member.roles.add(rankRole).catch((err) => {});

      const ranksToRemove = member.guild.roles.cache.filter(
        (r) =>
          config.rankRoleNames.some((name) => r.name.startsWith(name)) &&
          member.roles.cache.has(r.id) &&
          (rankRole ? r.id !== rankRole.id : true),
      );

      for (const [id] of ranksToRemove) {
        await member.roles.remove(id).catch((err) => {});
      }
    }

    await Utils.checkRoles({ member, regexp: adrRegexp, statsValue: adr, statsName: 'adr' });
    await Utils.checkRoles({ member, regexp: kdRegexp, statsValue: kd, statsName: 'kd' });
    await Utils.checkRoles({ member, regexp: wrRegexp, statsValue: wr, statsName: 'wr' });
  },

  async addPubgStats(args: AddPubgStatsArgs): Promise<MessageEmbed> {
    const { embed, matchType, view, gameNickname, pubgStatsData } = args;

    const type = view === 'fpp' ? matchType + '-fpp' : matchType;

    const specData: RankedStatsInfo =
      pubgStatsData.attributes[view === 'fpp' ? 'rankedGameModeStats' : 'gameModeStats']?.[type];

    if (!specData) return embed;

    const rankedPoints = specData ? specData.currentRankPoint : 0;

    const isRanked = view === 'fpp';

    const { tier, subTier } = specData?.currentTier ?? { tier: undefined, subTier: undefined };
    const rankEmojiID = afterConfig.ranksObj[tier ?? 'unranked'];

    const isZeroKD = specData.kills !== 0 && specData.deaths !== 0;
    const kd = isZeroKD ? parseFloat((specData.kills / specData.deaths).toFixed(2)) : 0;

    const matches = specData.roundsPlayed;
    const isZeroAdr = matches !== 0 && specData.damageDealt !== 0;
    const adr = isZeroAdr ? parseInt(Math.trunc(specData.damageDealt / matches).toFixed(0), 10) : 0;

    const losses = specData.losses;
    const wins = specData.wins;

    let winRate;

    if (wins) {
      winRate = losses ? parseFloat((wins / losses).toFixed(2)) * 100 : 100;
    } else {
      winRate = 0;
    }

    if (isRanked && specData.winRatio !== 0) {
      winRate = parseFloat(specData.winRatio.toFixed(2)) * 100;
    }

    const headshots = specData.headshotKills;

    const guild = client.guilds.cache.get(config.internal.workingGuild);

    const userDb = await usersRep.findOne({
      game_nickname: gameNickname,
    });
    if (!userDb) return embed;

    let updDocView: IViewStats = {};

    if (userDb[view]) {
      if (userDb[view][matchType]) updDocView = userDb[view];
      else if (!userDb[view][matchType]) {
        userDb[view][matchType] = {};
        updDocView = userDb[view];
      }
    } else {
      updDocView = {
        [matchType]: {},
      };
    }

    updDocView[matchType].rankedPoints = rankedPoints;
    updDocView[matchType].games = matches;
    updDocView[matchType].avd = adr;
    updDocView[matchType].kd = kd;
    updDocView[matchType].winRate = winRate;
    updDocView[matchType].wins = wins;
    updDocView[matchType].headshots = headshots;
    updDocView[matchType].rankedTier = tier;
    updDocView[matchType].rankedSubTier = subTier;

    if (matchType.toLowerCase() === 'squad') {
      const member = guild.members.cache.get(userDb.discord_id);
      if (member) {
        await Utils.checkStatsRoles({
          member,
          view,
          kd,
          wr: winRate,
          adr,
          rankInfo: `${tier} ${subTier}`,
        });
      }
    }

    await usersRep.update(
      {
        game_nickname: gameNickname,
      },
      {
        [view]: updDocView,
        last_stats_update: new Date(),
      },
    );

    const emojiText = client.emojis.cache.get(rankEmojiID) ?? '';
    const rankText = (tier ?? 'Unranked') + ' ' + (subTier ?? '');
    const rankedField = isRanked ? `${emojiText} ${rankText}: \`${rankedPoints ?? 0}\`` : '';

    return embed
      ? embed
          .addField(
            `PUBG • ${view.toUpperCase()} • ${isRanked ? 'Ranked' : ''} ${matchType.toUpperCase()}`,
            `**${rankedField}\n` +
              `>>> ${client.emojis.cache.get(config.emojis.damage)} AV-Damage: \`${adr ?? 0}\`\n` +
              `${client.emojis.cache.get(config.emojis.kd)} K/D: \`${kd ?? 0}\`\n` +
              `${client.emojis.cache.get(config.emojis.games)} Games: \`${matches ?? 0}\`\n` +
              `${client.emojis.cache.get(config.emojis.winRate)} WinRate: \`${
                Math.trunc(winRate) ?? 0
              }%\`\n` +
              `${client.emojis.cache.get(config.emojis.headshots)} H-Shots: \`${
                headshots ?? 0
              }\`**`,
            true,
          )
          .setTimestamp(Date.now())
      : null;
  },

  async addOldPubgStats(args: AddOldPubgStatsArgs): Promise<MessageEmbed> {
    const { embed, matchType, matchView, userDb } = args;

    if (!userDb?.[matchView]?.[matchType]) return embed;

    const isRanked = matchView === 'fpp';
    const stats: IMatchStats = userDb[matchView][matchType];

    const emojiID = afterConfig.ranksObj[stats.rankedTier ?? 'unranked'];

    const rankEmoji = client.emojis.cache.get(emojiID) ?? '';
    const rankText = ' ' + (stats.rankedTier ?? 'Unranked') + ' ' + (stats.rankedSubTier ?? '');
    const rankField = isRanked ? `${rankEmoji} ${rankText} : \`${stats.rankedPoints ?? 0}\`` : '';

    embed
      .addField(
        `PUBG • ${matchView.toUpperCase()} • ${
          isRanked ? 'Ranked' : ''
        } ${matchType.toUpperCase()}`,
        `**${rankField}\n` +
          `>>> ${client.emojis.cache.get(config.emojis.damage)} AV-Damage: \`${
            stats.avd ?? 0
          }\`\n` +
          `${client.emojis.cache.get(config.emojis.kd)} K/D: \`${stats.kd ?? 0}\`\n` +
          `${client.emojis.cache.get(config.emojis.games)} Games: \`${stats.games ?? 0}\`\n` +
          `${client.emojis.cache.get(config.emojis.winRate)} WinRate: \`${
            Math.trunc(stats.winRate) ?? 0
          }%\`\n` +
          `${client.emojis.cache.get(config.emojis.headshots)} H-Shots: \`${
            stats.headshots ?? 0
          }\`**`,
        true,
      )
      .setTimestamp(userDb.last_stats_update);

    if (matchType.toLowerCase() === 'squad') {
      const kd = stats.kd;
      const adr = stats.avd;
      const wr = stats.winRate;

      const guild = client.guilds.cache.get(config.internal.workingGuild);
      const member = await guild.members.fetch(userDb.discord_id).catch((err) => {});

      if (member) {
        await Utils.checkStatsRoles({
          member,
          view: matchView,
          kd,
          wr,
          adr,
          rankInfo: `${stats.rankedTier} ${stats.rankedSubTier}`,
        });
      }
    }

    return embed;
  },

  async updateSeekingEmbed(oldVC: VoiceChannel, newVC: VoiceChannel, updateType: UpdateEmbedType) {
    if (updateType === 'connect' || updateType === 'disconnect') {
      const vc = newVC || oldVC;

      if (afterConfig.seekingIgnoreList.includes(vc?.parentID)) return;

      const seeking = await seekingsRep.findOne({
        voice_channel: vc.id,
      });
      if (!seeking) return;

      const ch = vc.guild.channels.cache.get(seeking.msg_channel) as TextChannel;
      if (!ch) {
        await seekingsRep.delete({
          voice_channel: vc.id,
        });
        return;
      }

      await InternalUtils.editEmbedContent(ch, seeking, vc);
    } else if ('move') {
      const oldVcSeeking = await seekingsRep.findOne({
        voice_channel: oldVC.id,
      });

      if (oldVcSeeking) {
        const ch = oldVC.guild.channels.cache.get(oldVcSeeking.msg_channel) as TextChannel;
        if (!ch) {
          return seekingsRep.delete({
            voice_channel: oldVC.id,
          });
        }

        await InternalUtils.editEmbedContent(ch, oldVcSeeking, oldVC);
      }

      const newVcSeeking = await seekingsRep.findOne({
        voice_channel: newVC.id,
      });

      if (newVcSeeking) {
        const ch = newVC.guild.channels.cache.get(newVcSeeking.msg_channel) as TextChannel;
        if (!ch) {
          return seekingsRep.delete({
            voice_channel: oldVC.id,
          });
        }

        await InternalUtils.editEmbedContent(ch, newVcSeeking, newVC);
      }
    }
  },

  async genLfgEmbedDesc(args: GenLfgEmbedDescArgs): Promise<string> {
    const { vc, matchView, matchType, comment, inviteURL } = args;

    const membersMap = new Map<string, MemberEmbedInfo>();
    const isFull = vc.userLimit !== 0 ? vc.members.size >= vc.userLimit : false;

    const membersArr = vc.members.map((m) => ({
      id: m.id,
      nickname: m.nickname,
      username: m.user.username,
    }));

    for (const memberObj of membersArr) {
      const memberInfo = await Utils.addMemberInfo({
        memberObj,
        matchView,
        matchType,
        vc,
      });

      membersMap.set(memberObj.id, memberInfo);
    }

    const premEmoji = client.emojis.cache.get(config.emojis.aPremium);
    const commentEmoji = client.emojis.cache.get(config.emojis.comment);
    const limitEmoji = client.emojis.cache.get(config.emojis.limitation);

    const membersText = vc.members
      .map((m) => {
        const isPrem = m.roles.cache.has(config.roles.premium);
        const memberInfo = membersMap.get(m.id);
        const rankText = isPrem ? premEmoji : memberInfo?.rankText ?? '◾ ';
        const same = memberInfo?.sameEmoji ?? '';
        const registered = memberInfo?.registered ?? '';
        const isStats = m.roles.cache.has(config.roles.stats);
        const allStats = isStats ? memberInfo?.allStats ?? '' : '';

        return `<@${m.id}>${same}${registered} ${rankText} ${allStats}`;
      })
      .join('\n');

    const commentText = comment.length > 0 ? commentEmoji.toString() + ' ' + comment + '\n' : '';
    const name = vc.name.split(/\s+/g);
    const isAdr =
      vc.parentID === config.channels.category.fppAdr ||
      vc.parentID === config.channels.category.tppAdr;
    const isRankLimit = vc.parentID === config.channels.category.ranked;

    const adrText = isAdr ? `${limitEmoji} Ограничение на вход: **${name[1]} ${name[2]}**\n` : '';
    const rankName = vc.name.split(/\s+/g)[0];
    // const rankRole = vc.guild.roles.cache.find((r) => r.name === vc.name.split(/\s+/g)[0]);

    const rankLimText = isRankLimit ? `${limitEmoji} Ограничение на вход: ${rankName}\n` : '';
    const connectText = isFull ? `` : `Зайти: ${inviteURL}`;

    return `${membersText}\n\n${isFull ? '' : commentText + adrText + rankLimText}${connectText}`;
  },

  async addMemberInfo(args: AddMemberInfoArgs): Promise<MemberEmbedInfo> {
    const { memberObj, matchView, matchType, vc, fullChannel = false } = args;

    const userDb = await usersRep.findOne({
      discord_id: memberObj.id,
    });

    const isAnyPrem = vc.members.some((_) => _.roles.cache.has(config.roles.premium));
    const lfgType = isAnyPrem ? 'premium' : matchView;
    const { emojis } = config;

    const infoObj: MemberEmbedInfo = {};

    const stats: IMatchStats = userDb?.[matchView]?.[matchType];
    const emojisCache = client.emojis.cache;

    if (stats) {
      const emojiID = afterConfig.ranksObj[stats.rankedTier];
      if (emojiID) infoObj.rankText = emojisCache.get(emojiID)?.toString();
    }

    if (!userDb) {
      const noRegEmoji = emojisCache.get(config.emojis.noRegistration);
      const url = `https://discordapp.com/channels/${config.internal.workingGuild}/${config.channels.text.playersStats}`;

      infoObj.sameEmoji = ` [${noRegEmoji}](${url})`;
      infoObj.rankText = emojisCache.get(config.emojis.unranked)?.toString();

      return infoObj;
    } else {
      const { game_nickname } = userDb;

      if (memberObj?.nickname === game_nickname || memberObj?.username === game_nickname) {
        const id = fullChannel ? emojis.sameNicknameOff : emojis.lfgInfo[lfgType].sameNickname;
        const url = `https://pubg.op.gg/user/${game_nickname}`;

        infoObj.sameEmoji = `[${emojisCache.get(id)?.toString()}](${url})`;
      }

      if (!infoObj.sameEmoji) {
        const id = fullChannel ? emojis.infoRegisteredOff : emojis.lfgInfo[lfgType].info;
        const emoji = emojisCache.get(id);
        const url = `https://pubg.op.gg/user/${game_nickname}`;

        infoObj.registered = game_nickname ? `[${emoji?.toString()}](${url})` : '';
      }
    }

    if (!userDb?.[matchView]?.[matchType]?.rankedPoints) {
      infoObj.rankText = emojisCache.get(emojis.unranked)?.toString();
    }

    if (stats) {
      const rankInfo = (stats.rankedTier ?? '') + ' ' + (stats.rankedSubTier ?? '') + ' ';
      const kd = stats.kd ? `${emojisCache.get(emojis.kd)} ${stats.kd} ` : '';
      const avd = stats.avd ? `${emojisCache.get(config.emojis.damage)} ${stats.avd} ` : '';

      infoObj.allStats = (rankInfo ?? 'Unranked') + avd + kd;
    }

    return infoObj;
  },
};
