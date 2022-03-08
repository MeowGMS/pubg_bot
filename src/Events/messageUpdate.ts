import { config } from '../Extends/config';
import { client } from '../';
import { Logs } from '../Utils/Logs';

client.on('messageUpdate', (oldMsg, newMsg) => {
  if (!oldMsg.guild || oldMsg.guild.id !== config.internal.workingGuild) return;
  if (oldMsg.author.id === client.user.id) return;

  if (oldMsg.content.length === 0 || newMsg.content.length === 0) return;

  Logs.messageUpdate(oldMsg, newMsg);
});
