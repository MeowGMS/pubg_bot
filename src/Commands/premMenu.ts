import { Command } from './';
import { Message } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { config } from '../Extends/config';
import { client } from '../';

export default class PremMenu extends Command {
  name = 'prem_menu';
  alias = ['prem_menu'];
  clearMsgTimeout = 0;

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    if (!message.member.hasPermission('ADMINISTRATOR')) return;

    const banEmoji = client.emojis.cache.get(config.emojis.ban);

    const premMsgText = `**<@&${config.roles.premium}>**
   
🏠 • \`Вкл./Выкл. отображение Premium room\`
🗣️ • \`Вкл./Выкл. "Режима активации по голосу" в Вашей комнате\`
${banEmoji} • \`Быстрый БАН\` **(Пользователь должен находиться в комнате)**
   
**\`\`\`css
(Для выбора действия нажмите на реакцию)\`\`\`**
   
\`${config.internal.prefix}roomban <Упоминание>\` - Забанить/Разбанить пользователя в Вашей комнате`;

    const premMsg = await message.channel.send(premMsgText).catch((err) => {});
    if (!premMsg) return;

    await premMsg.react('🏠').catch((err) => {});
    await premMsg.react('🗣️').catch((err) => {});
    await premMsg.react(client.emojis.cache.get(config.emojis.ban)).catch((err) => {});

    const premPlusText = `**<@&${config.roles.premiumPlus}>**
   
🔅 • \`Изменить цвет роли\` **(Запрещено повторять цвета администрации сервера)**
✅ • \`Добавить друга в Вашу комнату\` **(Пользователь должен находиться в комнате)**
   
**\`\`\`fix
(Для выбора действия нажмите на реакцию)\`\`\`**`;

    const premPlusMsg = await message.channel.send(premPlusText).catch((err) => {});
    if (!premPlusMsg) return;

    await premPlusMsg.react('🔅').catch((err) => {});
    await premPlusMsg.react('✅').catch((err) => {});
  };
}
