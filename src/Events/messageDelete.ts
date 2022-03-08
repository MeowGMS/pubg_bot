import { config } from '../Extends/config';
import { client } from '../';
import { Logs } from '../Utils/Logs';

client.on('messageDelete', async (message) => {
  if (message.channel.type === 'dm' || message.guild.id !== config.internal.workingGuild) return;

  Logs.messageDelete(message);
});
