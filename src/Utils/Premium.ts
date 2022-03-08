import {
  CategoryChannel,
  Message,
  MessageEmbed,
  MessageReaction,
  PartialUser,
  PermissionOverwriteOption,
  Role,
  User,
  VoiceChannel,
} from 'discord.js';

import { config } from '../Extends/config';
import { client } from '../';

type HandlerType = 'add' | 'remove';
type MenuHandlerArgs = {
  r: MessageReaction;
  user: User | PartialUser;
  type: HandlerType;
  vc: VoiceChannel;
  role: Role;
};

const NUM_EMOJIS = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

export const findPremRoleQuery = (r: Role) => /^PREM \d{1,3} - /g.test(r.name);
export const filterFreeRolesQuery = (r: Role) => {
  return /prem \d{1,3} - свободно/g.test(r.name.toLowerCase());
};

export const PremiumMenu = {
  reactionHandler: async (r: MessageReaction, user: User | PartialUser, type: HandlerType) => {
    const guild = r.message.guild;

    const member =
      guild.members.cache.get(user.id) ?? (await guild.members.fetch(user.id).catch(console.error));
    if (!member) return;

    const role = member.roles.cache.find(findPremRoleQuery);
    const category = guild.channels.cache.get(config.channels.category.premium) as CategoryChannel;

    if (!role || !category) return;

    const findVcQuery = (vc: VoiceChannel) => {
      return vc.type === 'voice' && Boolean(vc.permissionOverwrites.get(role.id));
    };

    const vc = category.children.find(findVcQuery) as VoiceChannel;
    if (!vc) return;

    if (!member.voice.channel || member.voice.channel.id !== vc.id) return;

    const handlersArgs = { r, user, type, vc, role };

    switch (r.message.id) {
      case config.messages.premiumPlus:
        if (!member.roles.cache.has(config.roles.premiumPlus)) break;

        PremiumMenu.advancedMenuHandler(handlersArgs);
        break;
      case config.messages.premium:
        PremiumMenu.defaultMenuHandler(handlersArgs);
        break;
    }
  },

  defaultMenuHandler: async (args: MenuHandlerArgs) => {
    const { r, user, type, vc } = args;

    switch (r.emoji.name) {
      case '🏠':
        defaultMenu.lockRoom(vc, type);
        break;
      case '🗣️':
        defaultMenu.toggleVAD(vc, type);
        break;
    }

    switch (r.emoji.id) {
      case config.emojis.banPow:
        defaultMenu.blockMember(r, user, vc, 'block');
        break;
    }
  },

  advancedMenuHandler: async (args: MenuHandlerArgs) => {
    const { r, user, type, vc, role } = args;

    switch (r.emoji.name) {
      case '🔅':
        if (type === 'add') advancedMenu.changeRoleColor(r, user, role);
        break;
      case '✅':
        if (type === 'add') defaultMenu.blockMember(r, user, vc, 'add');
        break;
      case '🧽':
        if (type === 'add') advancedMenu.removeFromRoom(r, user, vc);
        break;
    }
  },
};

const defaultMenu = {
  lockRoom(vc: VoiceChannel, type: HandlerType) {
    vc.updateOverwrite(vc.guild.id, {
      VIEW_CHANNEL: type === 'add' ? null : false,
      CONNECT: null,
    });
  },

  toggleVAD(vc: VoiceChannel, type: HandlerType) {
    vc.updateOverwrite(vc.guild.id, {
      USE_VAD: type === 'add',
    });
  },

  async blockMember(
    r: MessageReaction,
    user: User | PartialUser,
    vc: VoiceChannel,
    actionType: 'block' | 'add',
  ) {
    r.users.remove(user.id).catch(console.error);

    if (vc.members.size === 0) return;
    if (vc.members.size == 1 && vc.members.first().id === user.id) return;

    const usersForBlock = vc.members.filter((m) => m.id !== user.id);
    if (usersForBlock.size === 0) return;

    const permsObj: PermissionOverwriteOption = {
      CONNECT: actionType === 'block' ? false : null,
      SPEAK: actionType === 'add',
      MOVE_MEMBERS: actionType === 'block' ? null : true,
      VIEW_CHANNEL: actionType === 'block' ? null : true,
    };
    const place = actionType === 'block' ? 'черный список' : 'комнату';

    if (usersForBlock.size === 1) {
      vc.createOverwrite(usersForBlock.first().id, permsObj).catch(console.error);
    } else if (usersForBlock.size > 1 && usersForBlock.size < 11) {
      const membersList = usersForBlock.map((m, i) => ({
        userID: m.id,
        emojiName: NUM_EMOJIS[i],
      }));

      const desc =
        `Выберите пользователя, которого хотите добавить в ${place}:\n\n` +
        usersForBlock.map((_) => _.toString() + '\n');

      const embed = new MessageEmbed()
        .setAuthor(user.tag, user.displayAvatarURL())
        .setColor(actionType === 'block' ? 'RED' : 'GREEN')
        .setTitle(`**Добавление в ${place} ` + vc.name + '**')
        .setDescription(desc);

      const manageMsg = await r.message.channel.send(embed).catch(console.error);
      if (!manageMsg) return;

      for (let i = 0; i < usersForBlock.size; i++) {
        await manageMsg.react(NUM_EMOJIS[i]).catch((err) => {});
      }

      const awaitFilter = (fReact: MessageReaction, fUser: User) => {
        return fUser.id == user.id && NUM_EMOJIS.includes(fReact.emoji.name);
      };

      const collected = await manageMsg
        .awaitReactions(awaitFilter, {
          time: 30000,
          maxEmojis: 1,
          errors: ['time'],
        })
        .catch(console.error);

      await manageMsg.delete().catch((err) => {});
      await r.users.remove(user.id).catch((err) => {});

      if (!collected) return;

      if (collected.size === 0) return;

      const userObj = membersList.find((_) => _.emojiName === collected.first().emoji.name);
      if (userObj) {
        await vc.updateOverwrite(userObj.userID, permsObj);
      }

      const blockedUser = await client.users.fetch(userObj.userID).catch((err) => {});
      if (!blockedUser) return;

      user.send(`**\\✅ Вы добавили ${blockedUser.tag} в ${place}**`).catch((err) => {});
    } else {
      const announceMsg = await r.message.channel
        .send(`**Упомяните пользователя, которого хотите добавить.\n\`(У вас есть 30 секунд)\`**`)
        .catch((err) => {});

      if (!announceMsg) return;

      const collected = await r.message.channel
        .awaitMessages((msgF) => msgF.author.id == user.id, {
          time: 30000,
          max: 1,
          errors: ['time'],
        })
        .catch(console.error);

      await announceMsg.delete().catch((err) => {});

      if (!collected) return;

      if (collected.size > 0 && collected.first().mentions.users.size > 0) {
        const userToBlock = collected.first().mentions.users.first();

        vc.updateOverwrite(userToBlock.id, permsObj).catch((err) => {});

        user.send(`**\\✅ Вы добавили ${userToBlock.tag} в ${place}**`).catch((err) => {});
      }
    }
  },
};

const advancedMenu = {
  async changeRoleColor(r: MessageReaction, user: User | PartialUser, role: Role) {
    const announceMsg = await r.message.channel
      .send('**Укажите цвет в HEX-формате (у Вас есть 60 секунд):**')
      .catch((err) => {});
    if (!announceMsg) return;

    r.users.remove(user.id).catch((err) => {});

    const collected = await r.message.channel
      .awaitMessages((m) => m.author.id == user.id, {
        max: 1,
        time: 60000,
        errors: ['time'],
      })
      .catch((err) => {});

    announceMsg.delete().catch((err) => {});

    const regExp = /[0-9A-Fa-f]{6}/g;

    if (!collected || !collected.size) {
      await r.message.channel
        .send(`**\\❌ Похоже, Вы не указали цвет или написали его в неправильном формате**`)
        .then((am: Message) => am.delete({ timeout: 5000 }));

      return;
    }

    const matched = collected.first().content.match(regExp);
    if (!matched || !matched.length) {
      await r.message.channel
        .send(`**\\❌ Похоже, Вы не указали цвет или написали его в неправильном формате**`)
        .then((am: Message) => am.delete({ timeout: 5000 }));

      return;
    }

    const color = matched[0];

    await role.setColor('#' + color).catch(console.error);

    await r.message.channel
      .send(`**\\✅ Цвет роли <@&${role.id}> успешно изменён**`)
      .then((am: Message) => am.delete({ timeout: 5000 }));

    for (const [, msg] of collected) {
      msg.delete().catch(console.error);
    }
  },

  async removeFromRoom(r: MessageReaction, user: User | PartialUser, vc: VoiceChannel) {
    const announceMsg = await r.message.channel
      .send(
        `**Упомяните пользователя, которого хотите удалить из комнаты.\n\`(У вас есть 30 секунд)\`**`,
      )
      .catch(console.error);

    if (!announceMsg) return;

    const collected = await r.message.channel
      .awaitMessages((msgF) => msgF.author.id == user.id, {
        time: 30000,
        max: 1,
        errors: ['time'],
      })
      .catch(console.error);

    await announceMsg.delete().catch((err) => {});

    if (!collected || !collected.size || !collected.first().mentions.users.size) {
      user.send(`**\\❌ Вы никого не удалили**`).catch((err) => {});
      return;
    }

    const userForRemove = collected.first().mentions.users.first();

    const overwrite = vc.permissionOverwrites.get(userForRemove.id);
    if (overwrite) {
      overwrite.delete().catch((err) => {});
      user.send(`**\\✅ Вы удалили ${userForRemove.tag} из комнаты**`).catch((err) => {});
    } else {
      user.send(`**\\❌ Вы никого не удалили**`).catch((err) => {});
    }

    r.users.remove(user.id).catch((err) => {});
  },
};
