import { Command } from './';
import { Message } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { afterConfig, config } from '../Extends/config';
import { InternalUtils } from '../Utils/Internal';
import { usersRep } from '../';

export default class DelReg extends Command {
  name = 'delreg';
  alias = ['delreg'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    const { member, mentions, guild } = message;

    if (!InternalUtils.hasPermission(member, afterConfig.canDeleteReg)) return;

    const userForDelete = mentions.users.first();

    const kdRegexp = new RegExp(`kd \\d{1,2}(.\\d{1,2})?\\+`, '');
    const adrRegexp = new RegExp(`adr \\d{1,3}(\\+)?`, '');
    const wrRegexp = new RegExp(`wr \\d{1,3}%(\\+)?`, '');

    if (userForDelete) {
      const userDb = await usersRep.findOne({
        discord_id: userForDelete.id,
      });

      if (!userDb) return errors.registrationNotFound();

      await usersRep.delete({
        discord_id: userForDelete.id,
      });

      const memberForDelete = guild.members.cache.get(userForDelete.id);
      const kdRolesRemove = memberForDelete.roles.cache.filter((r) =>
        kdRegexp.test(r.name.toLowerCase()),
      );
      const adrRoles = memberForDelete.roles.cache.filter((r) =>
        adrRegexp.test(r.name.toLowerCase()),
      );
      const wrRoles = memberForDelete.roles.cache.filter((r) =>
        wrRegexp.test(r.name.toLowerCase()),
      );

      if (memberForDelete.roles.cache.has(config.roles.stats)) {
        await memberForDelete.roles.remove(config.roles.stats).catch((err) => {});
      }

      for (const role of kdRolesRemove) {
        await memberForDelete.roles.remove(role).catch((err) => {});
      }
      for (const role of adrRoles) {
        await memberForDelete.roles.remove(role).catch((err) => {});
      }
      for (const role of wrRoles) {
        await memberForDelete.roles.remove(role).catch((err) => {});
      }

      const ranksToRemove = memberForDelete.guild.roles.cache.filter(
        (r) =>
          config.rankRoleNames.some((name) => r.name.startsWith(name)) &&
          memberForDelete.roles.cache.has(r.id),
      );

      for (const [id] of ranksToRemove) {
        await memberForDelete.roles.remove(id).catch((err) => {});
      }

      message.channel
        .send(`\\✅ Регистрация пользователя ${userForDelete} успешно удалена`)
        .catch(console.error);
    } else {
      const gameNickname = args[1];
      if (!gameNickname) return errors.noGameNickname();

      const userDb = await usersRep.findOne({
        game_nickname: gameNickname,
      });

      if (!userDb) return errors.registrationNotFound();

      await usersRep.delete({
        game_nickname: gameNickname,
      });

      const memberToDelete = await message.guild.members
        .fetch(userDb.discord_id)
        .catch((err) => {});
      if (memberToDelete) {
        const kdRolesRemove = memberToDelete.roles.cache.filter((r) =>
          kdRegexp.test(r.name.toLowerCase()),
        );
        const adrRoles = memberToDelete.roles.cache.filter((r) =>
          adrRegexp.test(r.name.toLowerCase()),
        );
        const wrRoles = memberToDelete.roles.cache.filter((r) =>
          wrRegexp.test(r.name.toLowerCase()),
        );

        if (memberToDelete.roles.cache.has(config.roles.stats)) {
          await memberToDelete.roles.remove(config.roles.stats).catch((err) => {});
        }
        for (const role of kdRolesRemove) {
          await memberToDelete.roles.remove(role).catch((err) => {});
        }
        for (const role of adrRoles) {
          await memberToDelete.roles.remove(role).catch((err) => {});
        }
        for (const role of wrRoles) {
          await memberToDelete.roles.remove(role).catch((err) => {});
        }

        const ranksToRemove = memberToDelete.guild.roles.cache.filter(
          (r) =>
            config.rankRoleNames.some((name) => r.name.startsWith(name)) &&
            memberToDelete.roles.cache.has(r.id),
        );

        for (const [id] of ranksToRemove) {
          await memberToDelete.roles.remove(id).catch((err) => {});
        }
      }

      message.channel
        .send(`\\✅ Регистрация никнейма ${gameNickname} успешно удалена`)
        .catch(console.error);
    }
  };
}
