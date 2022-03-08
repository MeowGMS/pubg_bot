import { Command } from './';
import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { afterConfig, config } from '../Extends/config';
import { client, kicksRep } from '../';
import { findPremRoleQuery } from '../Utils/Premium';
import { Kick } from '../Entities/Kick';

export default class KickCmd extends Command {
  name = 'kick';
  alias = ['votekick', 'kick'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    if (message.channel.id !== config.channels.text.report) return;

    const vc = message.member.voice.channel;
    if (!vc) return errors.authorNotInVc();

    if (afterConfig.seekingIgnoreList.includes(vc.parentID)) return errors.notGamingCategory();

    if (message.mentions.users.size === 0) return errors.userNotFound();

    const memberForKick = await message.guild.members.fetch(message.mentions.users.first().id);
    if (!memberForKick) return errors.memberNotFound();
    if (!memberForKick.voice.channel) return errors.memberNotInVc();
    if (memberForKick.voice.channel.id !== vc.id) return errors.memberNotInSameVc();

    if (vc.members.size < 3) return errors.needThirdMember();

    if (vc.parentID === config.channels.category.premium) {
      const memberOv = vc.permissionOverwrites.get(memberForKick.id);
      if (memberOv?.allow?.has('VIEW_CHANNEL')) return errors.roomOwnerKick();

      const premRole = memberForKick.roles.cache.find(findPremRoleQuery);
      if (vc.permissionOverwrites.get(premRole?.id)) return errors.roomOwnerKick();
    }

    const maxReactions = vc.members.size > 4 ? 3 : vc.members.size === 3 ? 1 : 2;
    const canKickMembers = vc.members
      .filter((_) => _.id !== memberForKick.id && _.id !== message.author.id)
      .map((_) => `<@${_.id}>`)
      .join(', ');

    const text =
      `${canKickMembers},\nВы согласны кикнуть ${memberForKick.user} с комнаты ` +
      `**${vc.name}**? Если да, нажмите на эмоцию ${client.emojis.cache.get(config.emojis.ban)}`;

    const voteMsg = await message.channel.send(text).catch((err) => {});
    if (!voteMsg) return;

    await voteMsg.react(client.emojis.cache.get(config.emojis.ban)).catch((err) => {});

    const reactFilter = (r: MessageReaction, user: User): boolean => {
      return (
        r.emoji.id === config.emojis.ban &&
        vc.guild.member(user.id).voice.channel?.id === vc.id &&
        user.id !== memberForKick.id &&
        user.id !== message.author.id
      );
    };

    const collected = await voteMsg
      .awaitReactions(reactFilter, {
        max: maxReactions,
        time: 30000,
      })
      .catch(console.error);

    if (!collected || !collected.size || collected.first().count < maxReactions) {
      const embed = new MessageEmbed()
        .setColor(config.colors.red)
        .setDescription(
          `🚷 ${memberForKick.user} не был кикнут из румы ${vc.name}. Инициатор: ${message.author}`,
        );

      await voteMsg.edit(embed).catch((err) => {});
    } else {
      memberForKick?.voice.setChannel(null).catch((err) => {});

      const embed = new MessageEmbed()
        .setDescription(
          `🚷 ${memberForKick.user} был кикнут из румы ${vc.name}. Инициатор: ${message.author}`,
        )
        .setColor(config.colors.green);

      await voteMsg.edit(embed).catch((err) => {});

      await vc
        .updateOverwrite(memberForKick.user.id, {
          CONNECT: false,
        })
        .catch(console.error);

      const kick = new Kick();

      kick.punish_id = memberForKick.user.id;
      kick.voice_id = vc.id;
      kick.unpunish_date = new Date(Date.now() + 30 * 60 * 1000);

      await kicksRep.save(kick);
    }

    await voteMsg.reactions.removeAll().catch((err) => {});
  };
}
