import { config } from '../Extends/config';
import { client } from '../';
import { reportReactionsHandler } from './Extends/Utils';
import { PremiumMenu } from '../Utils/Premium';

client.on('messageReactionAdd', async (r, user) => {
  if (user.bot) return;

  const { message, emoji } = r;

  if (!message.guild || message.guild.id !== config.internal.workingGuild) return;

  if (emoji.id === config.emojis.checkmark || emoji.id === config.emojis.deny) {
    reportReactionsHandler(r, user);
  }

  if (message.id === config.messages.premium || message.id === config.messages.premiumPlus) {
    PremiumMenu.reactionHandler(r, user, 'add');
  }
});
