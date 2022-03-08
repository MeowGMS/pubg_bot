import {
  GuildChannel,
  GuildMember,
  Message,
  MessageEmbed,
  PartialGuildMember,
  PartialMessage,
  TextChannel,
  VoiceChannel,
} from 'discord.js';
import { config } from '../Extends/config';
import { Utils } from './';
import { client } from '../';

export class Logs {
  public static voiceMovements = (
    oldVC: VoiceChannel,
    newVC: VoiceChannel,
    member: GuildMember,
  ): void => {
    const logChannel = client.channels.cache.get(config.channels.text.voiceLogs) as TextChannel;
    if (!logChannel) return;

    const strDate = Utils.getNormalDate(Date.now() + 3 * 60 * 60 * 1000);

    if (oldVC && newVC && oldVC.id !== newVC.id) {
      const embed = new MessageEmbed()
        .setColor(config.colors.blue)
        .setDescription(
          `🚀 Участник ${member.user} переместился из канала **<#${oldVC.id}>** в канал **<#${newVC.id}>** [\`${strDate}\`]`,
        );

      logChannel.send(embed).catch(console.error);
    }
    if (oldVC && !newVC) {
      const embed = new MessageEmbed()
        .setColor(config.colors.red)
        .setDescription(
          `🚷 Участник ${member.user} вышел из канала **<#${oldVC.id}>** [\`${strDate}\`]`,
        );

      logChannel.send(embed).catch(console.error);
    }
    if (!oldVC && newVC) {
      const embed = new MessageEmbed()
        .setColor(config.colors.green)
        .setDescription(
          `\\🚪 Участник ${member.user} вошёл в канал **<#${newVC.id}>** [\`${strDate}\`]`,
        );

      logChannel.send(embed).catch(console.error);
    }
  };

  public static enterGuild = (member: GuildMember): Promise<void> => {
    const enterLogCh = member.guild.channels.cache.get(
      config.channels.text.enterExit,
    ) as TextChannel;
    if (!enterLogCh) return;

    const date = Utils.getNormalDate(member.user.createdTimestamp + 3 * 60 * 60 * 1000);
    const text = `✅ **${member.user} вошёл. Дата создания аккаунта: ${date}. На сервере: ${member.guild.memberCount}**`;

    enterLogCh.send(text).catch(console.error);
  };

  public static leaveGuild = async (member: GuildMember | PartialGuildMember): Promise<void> => {
    const leaveLog = member.guild.channels.cache.get(config.channels.text.enterExit) as TextChannel;
    if (!leaveLog) return;

    const text = `❌ **${member.user.tag} вышел. ID: ${member.id}. На сервере: ${member.guild.memberCount}**`;

    leaveLog.send(text).catch(console.error);
  };

  public static messageDelete = async (message: Message | PartialMessage) => {
    const { author, attachments, content, guild, id, channel } = message;

    const logsChannel = guild.channels.cache.get(config.channels.text.msgsLogs) as TextChannel;
    if (!logsChannel) return;

    logsChannel
      .send({
        embed: new MessageEmbed()
          .setAuthor(`${author.tag} (ID: ${author.id})`, author.displayAvatarURL())
          .setDescription(`**\`\`${content ? content.slice(0, 900) : 'Без текста'}\`\`**`)
          .setFooter(`ID: ${id} • #${(channel as GuildChannel).name}`)
          .setTimestamp()
          .setColor('RED'),
        files: attachments.array(),
      })
      .catch(console.error);
  };

  public static messageUpdate = async (
    oldMsg: Message | PartialMessage,
    newMsg: Message | PartialMessage,
  ) => {
    const { author, guild, channel, id, content: oldContent } = oldMsg;
    const newContent = newMsg.content;

    if (newContent === oldContent) return;

    const logChannel = guild.channels.cache.get(config.channels.text.msgsLogs) as TextChannel;
    if (!logChannel) return;

    const embed = new MessageEmbed()
      .setAuthor(`${author.tag} (ID: ${author.id})`, author.displayAvatarURL())
      .setDescription(
        `**__[Ссылка на сообщение](${oldMsg.url})__\n` +
          `Старое:\n\`\`${oldContent.slice(0, 900)}\`\`\n` +
          `\nНовое:\n\`\`${newContent.slice(0, 900)}\`\`**`,
      )
      .setFooter(`ID: ${id} • #${(channel as GuildChannel).name}`)
      .setTimestamp()
      .setColor('BLUE');

    logChannel.send(embed).catch(console.error);
  };

  public static memberRolesUpdated = async (
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ) => {
    const oSize = oldMember.roles.cache.size;
    const nSize = newMember.roles.cache.size;

    const guild = oldMember.guild;

    const auditLogs = await oldMember.guild
      .fetchAuditLogs({
        type: 'MEMBER_ROLE_UPDATE',
      })
      .catch(console.error);

    if (!auditLogs) return;

    const entry = auditLogs.entries.first();

    const role = guild.roles.cache.get(entry?.changes[0]?.new?.[0]?.id);
    if (!role) return;

    const logsChannel = guild.channels.cache.get(config.channels.text.rolesLogs) as TextChannel;
    if (!logsChannel) return;

    const embedDesc =
      `${entry.executor} ${nSize > oSize ? 'добавляет' : 'убирает'}` +
      ` роль <@&${role.id}> (\`${role.name}\` • \`${role.members.size}\`) ` +
      `${nSize > oSize ? 'пользователю' : 'с пользователя'} ${entry.target}`;

    logsChannel
      .send(
        new MessageEmbed()
          .setDescription(embedDesc)
          .setColor(nSize > oSize ? config.colors.blue : config.colors.red),
      )
      .catch(console.error);
  };
}
