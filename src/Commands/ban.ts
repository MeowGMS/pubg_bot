import { Command } from './';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { afterConfig, config } from '../Extends/config';
import { Utils } from '../Utils';
import { client, punishmentsRep } from '../';
import { InternalUtils } from '../Utils/Internal';

export default class Ban extends Command {
  name = 'ban';
  alias = ['ban', 'бан'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    if (!InternalUtils.hasPermission(message.member, afterConfig.canUseBan)) {
      return errors.noPermsToUse();
    }

    if (message.mentions.users.size === 0) return errors.userNotFound();

    const memberForBan = await message.guild.members
      .fetch(message.mentions.users.first().id)
      .catch((err) => {});

    if (!memberForBan) return errors.memberNotFound();
    if (memberForBan.roles.cache.has(config.roles.ban)) return errors.memberIsAlreadyBanned();

    if (!args[2]) return errors.noTimeSpecified();

    const punishTime = Utils.timePostfixConverting(args[2]);
    if (!punishTime) return errors.noTimeSpecified();

    const reason = args[3] ? args.slice(3).join(' ') : 'Не указана';
    const timeStr = Utils.getNormalTime(punishTime);
    const punishment = await punishmentsRep.findOne({
      discord_id: memberForBan.id,
      type: 'ban',
    });

    if (punishment) {
      await punishmentsRep.update(punishment, {
        remove_date: new Date(Date.now() + punishTime),
      });
    } else await Utils.createPunishment(memberForBan.id, 'ban', punishTime);

    await memberForBan.roles.add(config.roles.ban).catch(console.error);

    message.channel
      .send(
        new MessageEmbed()
          .setColor(config.colors.red)
          .setTitle('**⛔ Бан**')
          .setDescription(
            `${memberForBan.user} забанен на ${timeStr}\n\n**Модератор ${message.author}: \`\`\`fix\n${reason}\`\`\`**`,
          ),
      )
      .catch((err) => {});

    memberForBan.user
      .send(
        new MessageEmbed()
          .setColor(config.colors.red)
          .setTitle('**⛔ Бан**')
          .setDescription(`На ${timeStr}\n\n**Причина: \`\`\`fix\n${reason}\`\`\`**`),
      )
      .catch();

    const dateStr = Utils.getNormalDate(Date.now() + 3 * 60 * 60 * 1000);

    const logsChannel = client.channels.cache.get(config.channels.text.modLogs) as TextChannel;
    if (logsChannel)
      await logsChannel
        .send(
          `${message.author} выдаёт бан ${memberForBan} на ${timeStr}\n\n[\`${dateStr}\`]\n\`\`\`fix\n${reason}\`\`\``,
        )
        .catch((err) => {});
  };
}
