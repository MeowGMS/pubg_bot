import { Utils } from '../Utils';
import { afterConfig, config } from '../Extends/config';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { client } from '../';

export const CommandsQuery = new Map<string, QueryInfo>();

client.on('message', async (message) => {
  if (message.channel.type === 'dm') return Utils.dmHandler(message);

  const member =
    message.member ?? (await message.guild.members.fetch(message.author.id).catch((err) => {}));

  if (!member && message.channel.id === config.channels.text.playersStats) {
    return new CommandsErrors(message).try_off_invise_mode();
  }

  if (!member) return;

  if (afterConfig.aCheckMarkChannels.includes(message.channel.id)) {
    message.react(client.emojis.cache.get(config.emojis.aCheckmark)).catch(console.error);
  }
  if (
    // LFG 10sec Remover
    message.channel.id === config.channels.text.lfg &&
    !member.hasPermission('ADMINISTRATOR') &&
    member.id !== client.user.id
  ) {
    message.delete({ timeout: 10000 }).catch((err) => {});
  }

  if (!message.content.startsWith(config.internal.prefix)) return;

  if (
    !member.hasPermission('ADMINISTRATOR') &&
    !CommandsQuery[message.author.id] &&
    message.channel.id === config.channels.text.lfg
  ) {
    CommandsQuery[message.author.id] = {
      time: new Date(),
      first: true,
    };

    setTimeout(() => {
      delete CommandsQuery[message.author.id];
    }, Math.floor(member.roles.cache.has(config.roles.premium) ? config.rates.premCD : config.rates.userCD));
  }

  const args = message.content.split(/\s+/g);

  const commandText = args[0]?.toLowerCase();
  if (!commandText) return;

  const cmd = client.commands.get(commandText.slice(config.internal.prefix.length));
  if (!cmd) return;

  const timeout = cmd.clearMsgTimeout;
  if (timeout || timeout === 0) {
    await message.delete({ timeout }).catch((err) => {});
  }

  cmd.run(message, args, new CommandsErrors(message));
});
