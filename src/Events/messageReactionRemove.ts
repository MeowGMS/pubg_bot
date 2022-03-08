import { config } from '../Extends/config';
import { client } from '../';
import { PremiumMenu } from '../Utils/Premium';

client.on('messageReactionRemove', (r, user) => {
  if (user.bot) return;
  const message = r.message;
  if (!message.guild || message.guild.id != config.internal.workingGuild) return;

  PremiumMenu.reactionHandler(r, user, 'remove');
});
