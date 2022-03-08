import { Command } from './';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { afterConfig, config } from '../Extends/config';
import { Utils } from '../Utils';
import { InternalUtils } from '../Utils/Internal';
import { punishmentsRep } from '../';

export default class Unmute extends Command {
  name = 'unmute';
  alias = ['unmute', 'размут'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    const { member, mentions, guild } = message;

    if (!InternalUtils.hasPermission(member, afterConfig.canUseMute)) {
      return errors.noPermsToUse();
    }

    if (!mentions.users.size) return errors.userNotFound();

    const memberForUnmute = await guild.members.fetch(mentions.users.first().id).catch((err) => {});
    if (!memberForUnmute) return errors.memberNotFound();

    if (!memberForUnmute.roles.cache.has(config.roles.mute)) return errors.memberHasNoMute();

    await punishmentsRep.delete({
      discord_id: memberForUnmute.id,
      type: 'mute',
    });

    await memberForUnmute.roles.remove(config.roles.mute).catch((err) => {});

    const embed = new MessageEmbed()
      .setColor(config.colors.green)
      .setTitle('**\\✅ Размут**')
      .setDescription(`${memberForUnmute.user} размучен\n\n**Модератор: ${message.author}**`);

    message.channel.send(embed).catch((err) => {});

    const logsChannel = guild.channels.cache.get(config.channels.text.modLogs) as TextChannel;
    if (logsChannel) {
      const strDate = Utils.getNormalDate(Date.now() + 3 * 60 * 60 * 1000);
      logsChannel
        .send(`${message.author} снимает мут ${memberForUnmute} [\`${strDate}\`]`)
        .catch((err) => {});
    }
  };
}
