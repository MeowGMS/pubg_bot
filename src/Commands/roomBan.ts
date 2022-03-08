import { Command } from './';
import { GuildChannel, Message, MessageEmbed, VoiceChannel } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { config } from '../Extends/config';
import { findPremRoleQuery } from '../Utils/Premium';

export default class RoomBan extends Command {
  name = 'roomban';
  alias = ['roomban', 'банрумы'];
  clearMsgTimeout = 0;

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    const { member, guild, author, mentions } = message;

    const premRole = member.roles.cache.find(findPremRoleQuery);
    if (!premRole) return;

    const findVcQuery = (ch: GuildChannel) => Boolean(ch.permissionOverwrites?.get(premRole.id));

    const premVc = guild.channels.cache.find(findVcQuery) as VoiceChannel;
    if (!premVc) return errors.premiumChNotFound();

    const userForBan = mentions.users.first();
    if (!userForBan) return errors.userNotFound();

    const overwrite = premVc.permissionOverwrites.get(userForBan.id);

    const embed = new MessageEmbed()
      .setAuthor(author.tag, author.displayAvatarURL())
      .setTitle(`**Комната \`${premVc.name}\`**`);

    if (overwrite) {
      overwrite.delete().catch((err) => {});
      embed.setColor(config.colors.green).setDescription(`**Пользователь ${userForBan} разбанен**`);
    } else {
      const memberForBan = message.guild.member(userForBan);
      premVc
        .updateOverwrite(userForBan.id, {
          CONNECT: false,
        })
        .catch((err) => {});

      if (memberForBan && memberForBan.voice.channelID === premVc.id) {
        memberForBan.voice.setChannel(null).catch((err) => {});
      }

      embed.setColor(config.colors.red).setDescription(`**Пользователь ${userForBan} забанен**`);
    }

    message.channel
      .send(embed)
      .then((m: Message) => m.delete({ timeout: 10000 }))
      .catch((err) => {});
  };
}
