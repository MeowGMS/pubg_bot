import { Command } from './';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { afterConfig, config } from '../Extends/config';
import { Utils } from '../Utils';
import { client, punishmentsRep } from '../';
import { InternalUtils } from '../Utils/Internal';

export default class Mute extends Command {
  name = 'mute';
  alias = ['mute', 'мут'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    const { member, mentions, guild, author } = message;

    if (!InternalUtils.hasPermission(member, afterConfig.canUseMute)) {
      return errors.noPermsToUse();
    }

    const mentionedID = mentions.users.first()?.id;
    if (!mentionedID) return errors.userNotFound();

    const memberForMute = await guild.members.fetch(mentionedID).catch((err) => {});
    if (!memberForMute) return errors.memberNotFound();

    if (memberForMute.roles.cache.has(config.roles.mute)) return errors.memberIsAlreadyMuted();

    if (!args[2]) return errors.noTimeSpecified();

    const punishTime = Utils.timePostfixConverting(args[2]);
    if (!punishTime) return errors.noTimeSpecified();

    const reason = args[3] ? args.slice(3).join(' ') : 'Не указана';

    const punishment = await punishmentsRep.findOne({
      discord_id: memberForMute.id,
      type: 'mute',
    });

    if (punishment) {
      await punishmentsRep.update(punishment, {
        remove_date: new Date(Date.now() + punishTime),
      });
    } else {
      await Utils.createPunishment(memberForMute.id, 'mute', punishTime);
    }

    await memberForMute.roles.add(config.roles.mute).catch(console.error);

    const strTime = Utils.getNormalTime(punishTime);
    const descText = `${memberForMute.user} замучен на ${strTime}\n\n**Модератор ${author}: \`\`\`fix\n${reason}\`\`\`**`;

    const embed = new MessageEmbed()
      .setColor(config.colors.red)
      .setTitle('**⛔ Мут**')
      .setDescription(descText);

    message.channel.send(embed).catch((err) => {});

    const dmEmbed = new MessageEmbed()
      .setColor(config.colors.red)
      .setTitle('**⛔ Мут**')
      .setDescription(`На ${strTime}\n\n**Причина: \`\`\`fix\n${reason}\`\`\`**`);

    memberForMute.user.send(dmEmbed).catch((err) => {});

    const logsChannel = client.channels.cache.get(config.channels.text.modLogs) as TextChannel;
    if (!logsChannel) return;

    const strDate = Utils.getNormalDate(Date.now() + 3 * 60 * 60 * 1000);
    const msgText = `${message.author} мутит ${memberForMute} на ${strTime} \n\n[\`${strDate}\`]\n\`\`\`fix\n${reason}\`\`\``;

    logsChannel.send(msgText).catch((err) => {});
  };
}
