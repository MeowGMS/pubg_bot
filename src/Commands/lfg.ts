import { Command } from './';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { afterConfig, config } from '../Extends/config';
import { room_invites } from '../Extends/invites';
import { Utils } from '../Utils';
import { client, seekingsRep } from '../';
import { Seeking } from '../Entities/Seeking';
import { CommandsQuery } from '../Events/message';

export default class Lfg extends Command {
  name = 'lfg';
  alias = ['tpp', 'fpp', 'tppr', 'fppr'];
  clearMsgTimeout = 0;

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    if (message.channel.id !== config.channels.text.lfg) return;

    const { guild, author, channel } = message;

    const vc = message.member.voice.channel;

    if (!vc) return errors.authorNotInVc();
    if (afterConfig.seekingIgnoreList.includes(vc.parentID)) {
      return errors.notGamingCategory();
    }

    const member = message.member || (await guild.members.fetch(author.id).catch(console.error));
    if (!member) return;

    if (vc.members.size >= vc.userLimit && vc.userLimit !== 0) return errors.fullVoiceChannel();

    const hasRole = member.roles.cache.has(config.roles.premium);
    const extraTime = hasRole ? config.rates.premCD : config.rates.userCD;

    const isRanked = args[0].toLowerCase().endsWith('r');

    if (CommandsQuery.has(author.id)) {
      const info = CommandsQuery.get(author.id);

      if (!info.first && info.time + extraTime > Date.now()) {
        const waitTime = Math.floor((extraTime - (Date.now() - info.time)) / 1000);
        const embed = new MessageEmbed()
          .setTitle(
            `**\\❗ Ограничение на команду поиска - \`${Math.floor(extraTime / 1000)} секунд\`**`,
          )
          .setDescription(`**Вам осталось ждать ${waitTime} сек.**`)
          .setColor(config.colors.invisible);

        return message.author
          .send(embed)
          .catch((err) => {})
          .then((m: Message) => m.delete({ timeout: 10000 }).catch((err) => {}));
      }
    }

    const matchView = args[0]
      .slice(1)
      .slice(0, isRanked ? -1 : args[0].length - 1)
      .toLowerCase() as GameViews;

    const matchType = vc.userLimit === 2 ? 'duo' : 'squad';

    let comment = '';

    if (args[1]) {
      const commentArgs = args
        .slice(1)
        .join(' ')
        .replace(/https?:\/\/discord\.gg\/\w{5,9}/gi, '');

      comment = commentArgs.slice(0, 100) + (commentArgs.length > 100 ? '...' : '');
    }

    if (vc.parentID === config.channels.category.ranked && matchView !== 'fpp') {
      return errors.wrongLfgCommand();
    }

    const lfgAdrLimits = [config.channels.category.tppAdr, config.channels.category.fppAdr];

    const isLfgLimit = [
      config.channels.voice.fppSquads,
      config.channels.voice.tppSquads,
    ].some((c) => c.includes(vc.parentID));

    if (
      (lfgAdrLimits.includes(vc.parentID) || isLfgLimit) &&
      !vc.name.toLowerCase().includes(matchView)
    ) {
      return errors.wrongLfgCommand();
    }

    const seeking = await seekingsRep.findOne({
      voice_channel: vc.id,
    });

    if (seeking) {
      if (Math.floor((extraTime - (Date.now() - seeking.last_bump.getTime())) / 1000) > 0) {
        const waitTime = Math.floor(
          (extraTime - (Date.now() - seeking.last_bump.getTime())) / 1000,
        );
        const embed = new MessageEmbed()
          .setTitle(`**\\❗ Ограничение на команду поиска - \`${extraTime / 1000} секунд\`**`)
          .setDescription(`**Вам осталось ждать ${waitTime} сек.**`)
          .setColor(config.colors.invisible);

        return author
          .send(embed)
          .catch((err) => {})
          .then((m: Message) => m.delete({ timeout: 10000 }).catch((err) => {}));
      }
      if (CommandsQuery.has(author.id)) CommandsQuery.get(author.id).first = false;

      const msgChannel = guild.channels.cache.get(seeking.msg_channel) as TextChannel;
      if (msgChannel) {
        msgChannel.messages
          .fetch(seeking.message)
          .then((m) => m.delete().catch((err) => {}))
          .catch((err) => {});
      }
    }

    let inviteURL: string;
    if (room_invites[vc.id]) {
      inviteURL = room_invites[vc.id];
    } else {
      const reqInvites = await vc.fetchInvites();
      if (reqInvites.size > 0) {
        inviteURL = reqInvites.first().url;
      } else {
        inviteURL = (await vc.createInvite({ maxAge: 0 })).url;
      }
    }

    const freeSlots = vc.userLimit === 0 ? '' : '+' + (vc.userLimit - vc.members.size);
    const rankedText = '';
    const viewText = matchView.toUpperCase();
    const authorFieldName = `В поисках ${freeSlots} • ${rankedText} ${viewText} • ${vc.name}`;

    const embed = new MessageEmbed()
      .setColor(Utils.colorGenerator(vc, matchView))
      .setAuthor(authorFieldName, message.author.avatarURL())
      .setThumbnail(Utils.thumbnailGenerator(vc, matchView, matchType, isRanked))
      .setImage(config.images.invisible)
      .setDescription(
        await Utils.genLfgEmbedDesc({ vc, comment, inviteURL, matchType, matchView }),
      );

    const lfgMsg = await channel.send(embed).catch(console.error);
    if (!lfgMsg) return;

    if (seeking) {
      seekingsRep
        .update(
          {
            voice_channel: vc.id,
          },
          {
            msg_channel: lfgMsg.channel.id,
            message: lfgMsg.id,
            last_bump: new Date(),
            comment: comment.length > 0 ? comment : seeking.comment,
          },
        )
        .catch(console.error);
    } else {
      const newSeeking = new Seeking();

      newSeeking.voice_channel = vc.id;
      newSeeking.msg_channel = lfgMsg.channel.id;
      newSeeking.message = lfgMsg.id;
      newSeeking.author = author.id;
      newSeeking.last_bump = new Date();
      newSeeking.created_at = new Date();
      newSeeking.invite = inviteURL;
      newSeeking.comment = comment;
      newSeeking.is_ranked = isRanked;

      await seekingsRep.save(newSeeking);
    }
  };
}
