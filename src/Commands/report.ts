import { Command } from './';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { config } from '../Extends/config';
import { client, reportsRep } from '../';
import { Report } from '../Entities/Report';

export default class ReportCommand extends Command {
  name = 'report';
  alias = ['report', 'репорт'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    const { channel, guild, author, mentions } = message;

    if (channel.id !== config.channels.text.report) return;

    const reportedMember = mentions.members.first();
    if (!reportedMember || reportedMember.id === author.id) return errors.memberNotFound();

    const reportReason = args.slice(2).join(' ');
    if (!reportReason) return errors.noReasonSpecified();

    const reportLogs = guild.channels.cache.get(config.channels.text.reportLogs) as TextChannel;
    if (!reportLogs) return;

    const modEmbed = new MessageEmbed()
      .setTitle('**Новый репорт**')
      .setColor('GOLD')
      .addField(
        '**Отправитель:**',
        `**Пользователь: ${author}\nТег: ${author.tag}\nID: ${author.id}**`,
        true,
      )
      .addField(
        '**Подозреваемый:**',
        `**Пользователь: ${reportedMember.user}\nТег: ${reportedMember.user.tag}\nID: ${reportedMember.user.id}**`,
        true,
      )
      .addField(
        '**Причина:**',
        `\`\`\`fix\n${reportReason.slice(0, 300) + (reportReason.length > 300 ? '...' : '')}\`\`\``,
      )
      .setImage(
        message.attachments.size > 0
          ? message.attachments.first().proxyURL
          : config.images.invisible,
      );

    const modReportMsg = await reportLogs
      .send({
        embed: modEmbed,
      })
      .catch((err) => {});

    if (!modReportMsg) return;

    await modReportMsg.react(client.emojis.cache.get(config.emojis.checkmark)).catch((err) => {});
    await modReportMsg.react(client.emojis.cache.get(config.emojis.deny)).catch((err) => {});

    const formReason = reportReason.slice(0, 40) + (reportReason.length > 40 ? '...' : '');
    const text = `Ваш репорт на <@${reportedMember.user.id}> (${formReason}) успешно отправлен отправлен. Ожидайте новое сообщение.`;
    const dmMsg = await message.author.send(text).catch((err) => {
      if (err === 50007) {
        message.channel
          .send(`${message.author}, откройте личные сообщение для отправления уведомления.`)
          .then((m) => m.delete({ timeout: 7000 }));
      }
    });

    const newReport = new Report();

    newReport.author = author.id;
    newReport.report_msg_channel = channel.id;
    newReport.report_message = modReportMsg.id;
    newReport.reason = reportReason;
    newReport.dm_channel = dmMsg ? dmMsg.channel.id : '';
    newReport.dm_message = dmMsg ? dmMsg.id : '';

    await reportsRep.save(newReport).catch(console.error);
    await message.react(client.emojis.cache.get(config.emojis.telegram)).catch((err) => {});
  };
}
