import { Command } from './';
import { Message, MessageEmbed } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { config } from '../Extends/config';
import { client, usersRep } from '../';
import { Utils } from '../Utils';
import axios from 'axios';
import { User } from '../Entities/User';

export default class Register extends Command {
  name = 'reg';
  alias = ['reg', 'рег'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    if (message.channel.id !== config.channels.text.playersStats) return;

    const gameNickname = args[1] ?? message.member.displayName;
    const { member, author, guild } = message;

    const nicknameDbCheck = await usersRep.findOne({
      game_nickname: gameNickname,
    });

    if (nicknameDbCheck?.pubg_id) {
      new CommandsErrors(message, gameNickname).thatNicknameAlreadyExists();
      return message.delete().catch((err) => {});
    }

    const userRequestUrl = `https://api.pubg.com/shards/steam/players?filter[playerNames]=${gameNickname}`;
    const userResponse = await axios
      .get(userRequestUrl, {
        headers: {
          accept: 'application/vnd.api+json',
          Authorization: config.internal.pubgApiToken,
        },
      })
      .catch((err) => {});

    if (!userResponse || userResponse.status === 404) return errors.apiErrorNotFound();

    if (userResponse.status === 429) return errors.apiTooManyRequests();
    if (userResponse.status !== 200) console.log(`Статус код ${userResponse.status}`);

    const pubgDataArr: PubgApiData[] = userResponse.data.data;
    if (!pubgDataArr || pubgDataArr.length === 0) return errors.apiErrorNotFound();

    const embed = new MessageEmbed();

    const userDb = await usersRep.findOne({
      discord_id: author.id,
    });

    const steamEmoji = client.emojis.cache.get(config.emojis.steam);
    const pubgData = pubgDataArr[0];

    if (userDb) {
      await usersRep.update(
        {
          discord_id: author.id,
        },
        {
          game_nickname: gameNickname,
          pubg_id: pubgData.id,
          fpp: null,
          tpp: null,
        },
      );
      const newUserObj = { ...userDb, game_nickname: gameNickname };
      const nicknameCheck = Utils.checkNicknameEquality(newUserObj, member);

      embed
        .setColor(config.colors.invisible)
        .setAuthor(author.tag, author.displayAvatarURL(), `https://pubg.op.gg/user/${gameNickname}`)
        .setDescription(`${steamEmoji} Никнейм изменён. Новый: **${nicknameCheck}**`);
    } else {
      const nicknameCheck = Utils.checkNicknameEquality(gameNickname, member);
      const descText =
        `**${author}**, вы прошли регистрацию на сервере как:` +
        `\n${steamEmoji} **${nicknameCheck}**\n\n**__Статистика автоматически обновилась__**`;

      embed
        .setAuthor(author.tag, author.displayAvatarURL(), `https://pubg.op.gg/user/${gameNickname}`)
        .setThumbnail(
          'https://cdn.discordapp.com/attachments/596260124528476171/605486510942322709/27353897.gif',
        )
        .setDescription(descText)
        .setColor(config.colors.gold)
        .setFooter(`${config.internal.prefix}reg [Игровой никнейм] - Регистрация`, guild.iconURL());

      const newUser = new User();

      newUser.discord_id = message.author.id;
      newUser.game_nickname = gameNickname;
      newUser.pubg_id = pubgData.id;

      usersRep.save(newUser).catch(console.error);
    }

    if (!message.member.roles.cache.has(config.roles.premium)) {
      await message.member.roles.add(config.roles.stats).catch((err) => {});
    }

    const fppStatsRequestUrl = `https://api.pubg.com/shards/steam/players/${pubgData.id}/seasons/${config.internal.offSeasonName}/ranked`;
    const fppStatsResponse = await axios
      .get(fppStatsRequestUrl, {
        headers: {
          accept: 'application/vnd.api+json',
          Authorization: config.internal.pubgApiToken,
        },
      })
      .catch(console.error);

    const tppStatsRequestUrl = `https://api.pubg.com/shards/steam/players/${pubgData.id}/seasons/${config.internal.offSeasonName}`;
    const tppStatsResponse = await axios
      .get(tppStatsRequestUrl, {
        headers: {
          accept: 'application/vnd.api+json',
          Authorization: config.internal.pubgApiToken,
        },
      })
      .catch(console.error);

    if (fppStatsResponse && fppStatsResponse.status === 200 && tppStatsResponse) {
      const fppPubgData: PubgApiStatsData = fppStatsResponse.data.data;
      const tppPubgData: PubgApiStatsData = tppStatsResponse.data.data;

      for (const view of ['tpp', 'fpp']) {
        for (const type of ['solo', 'duo', 'squad']) {
          await Utils.addPubgStats({
            matchType: type as GameMatchType,
            view: view as GameViews,
            gameNickname,
            pubgStatsData: view === 'fpp' ? fppPubgData : tppPubgData,
          });
        }
      }
    }

    message.channel.send(embed).catch(console.error);
  };
}
