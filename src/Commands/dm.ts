import { Command } from './';
import { Message } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { afterConfig, config } from '../Extends/config';
import { InternalUtils } from '../Utils/Internal';

export default class DmCmd extends Command {
  name = 'dm';
  alias = ['dm', 'dmmsg'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    if (message.channel.id !== config.channels.text.dmLogs) return;

    if (!InternalUtils.hasPermission(message.member, afterConfig.canUseBan)) return;

    const userToDm = message.mentions.users.first();
    if (!userToDm) return;

    const dmChannel = await userToDm.createDM().catch((err) => {});
    if (!dmChannel) return;

    const text = args.slice(2).join(' ');
    if (!text) return;

    await dmChannel.send(text).catch((err) => {});

    message.channel.send(`${userToDm}, ${text}`).catch((err) => {});
  };
}
