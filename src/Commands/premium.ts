import { Command } from './';
import { Message, MessageEmbed, VoiceChannel } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { Utils } from '../Utils';
import { afterConfig, config } from '../Extends/config';
import { premiumsRep } from '../';
import { Premium } from '../Entities/Premium';
import { filterFreeRolesQuery } from '../Utils/Premium';
import { InternalUtils } from '../Utils/Internal';

export default class PremiumCommand extends Command {
  name = 'premium';
  alias = ['premium', 'премиум'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    const { member, mentions, guild, author, channel } = message;

    if (!InternalUtils.hasPermission(member, afterConfig.canGivePremium)) {
      return errors.noPermsToUse();
    }

    const mentionedID = mentions.users.first()?.id;
    if (!mentionedID) return errors.userNotFound();

    const memberForPrem = await guild.members.fetch(mentionedID).catch((err) => {});
    if (!memberForPrem) return errors.memberNotFound();

    if (!args[2]) return errors.noTimeSpecified();

    const premTime = Utils.timePostfixConverting(args[2]);
    const isPremPlus = Boolean(args[3]);

    const premium = await premiumsRep.findOne({
      discord_id: memberForPrem.id,
    });

    let removeTS: number;
    let newRole = false;

    if (premium?.remove_date?.getTime() > Date.now()) {
      removeTS = premium.remove_date.getTime() + premTime;

      await premiumsRep.update(
        {
          discord_id: memberForPrem.id,
        },
        {
          remove_date: new Date(removeTS),
          get_times: premium.get_times + 1,
        },
      );
    } else {
      const freeRoles = guild.roles.cache.filter(filterFreeRolesQuery);
      if (!freeRoles.size) {
        return message.channel
          .send(`**\\❌ Свободные роли для премиумов не найдены**`)
          .then((m: Message) => m.delete({ timeout: 4000 }));
      }

      const role = freeRoles.sort((a, b) => b.position - a.position).first();

      const findChQuery = (ch: VoiceChannel) => {
        const isPremCategory = ch.parentID == config.channels.category.premium;

        return ch.permissionOverwrites?.get(role.id) && isPremCategory;
      };

      const premChannel = guild.channels.cache.find(findChQuery);

      if (!premChannel) {
        return channel
          .send(`**\\❌ Канал, привязанный к роли не найден**`)
          .then((m: Message) => m.delete({ timeout: 4000 }));
      }

      removeTS = Date.now() + premTime;

      if (premium) {
        premiumsRep
          .update(
            {
              discord_id: memberForPrem.id,
            },
            {
              remove_date: new Date(removeTS),
              get_times: 1,
            },
          )
          .catch(console.error);
      } else {
        const newPrem = new Premium();

        newPrem.discord_id = memberForPrem.id;
        newPrem.remove_date = new Date(removeTS);
        newPrem.role_id = role.id;
        newPrem.get_times = 1;

        await premiumsRep.save(newPrem).catch(console.error);
      }

      if (isPremPlus) {
        memberForPrem.roles
          .add([config.roles.premium, role.id, config.roles.premiumPlus])
          .catch(console.error);
      } else {
        memberForPrem.roles.add([config.roles.premium, role.id]).catch();
      }

      const removePremDate = new Date(removeTS);

      newRole = true;

      const day = removePremDate.getDate();
      const month = removePremDate.getMonth() + 1;
      const year = removePremDate.getFullYear();

      const roleName = role.name.split(' - ')[0] + ' - ' + `${day}.${month}.${year}`;

      await role.setName(roleName).catch(console.error);
    }

    const activity = newRole ? 'выдал' : 'продлил на';
    const roleID = isPremPlus ? config.roles.premiumPlus : config.roles.premium;
    const timeStr = Utils.getNormalTime(premTime);

    const embed = new MessageEmbed()
      .setColor('#f5dc26')
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(
        `${author} ${activity} <@&${roleID}> пользователю ${memberForPrem.user} на ${timeStr}`,
      )
      .setFooter('Премиум закончится:')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/596260124528476171/597473683518521355/premium.png',
      )
      .setTimestamp(removeTS);

    message.channel.send(embed).catch(console.error);
  };
}
