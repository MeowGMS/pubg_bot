import { Command } from './';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { afterConfig, config } from '../Extends/config';
import { Utils } from '../Utils';
import { InternalUtils } from '../Utils/Internal';
import { punishmentsRep } from '../';

export default class Unban extends Command {
  name = 'unban';
  alias = ['unban', 'разбан'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    const { member, mentions, guild, author, channel } = message;

    if (!InternalUtils.hasPermission(member, afterConfig.canUseBan)) {
      return errors.noPermsToUse();
    }

    const toBanID = mentions.users?.first()?.id;
    if (!toBanID) return errors.userNotFound();

    const memberForUnban = await guild.members.fetch(toBanID).catch((err) => {});
    if (!memberForUnban) return errors.memberNotFound();

    if (!memberForUnban.roles.cache.has(config.roles.ban)) return errors.memberHasNoBan();

    await punishmentsRep.delete({
      discord_id: memberForUnban.id,
      type: 'ban',
    });

    await memberForUnban.roles.remove(config.roles.ban).catch((err) => {});

    const embed = new MessageEmbed()
      .setColor(config.colors.green)
      .setTitle('**\\✅ Разбан**')
      .setDescription(`${memberForUnban.user} разбанен\n\n**Модератор: ${author}**`);

    channel.send(embed).catch((err) => {});

    const logsChannel = guild.channels.cache.get(config.channels.text.modLogs) as TextChannel;
    if (logsChannel) {
      const strDate = Utils.getNormalDate(Date.now() + 3 * 60 * 60 * 1000);
      logsChannel
        .send(`${message.author} разбанивает ${memberForUnban} [\`${strDate}\`]`)
        .catch((err) => {});
    }
  };
}
