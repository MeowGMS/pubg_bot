import { Command } from './';
import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import { CommandsErrors } from '../Сlasses/CommandErrors';
import { afterConfig, config } from '../Extends/config';
import { client, usersRep } from '../';
import { Utils } from '../Utils';
import { InternalUtils } from '../Utils/Internal';
import axios from 'axios';

export default class Update extends Command {
  name = 'update';
  alias = ['update', 'rupdate'];

  public run = async (message: Message, args: string[], errors: CommandsErrors) => {
    const { channel, author, member } = message;

    if (channel.id !== config.channels.text.playersStats) return;

    const userDb = await usersRep.findOne({
      discord_id: author.id,
    });
    if (!userDb) return errors.dbUserNotFound();

    const gameNickname = userDb.game_nickname;
    if (!userDb.pubg_id || !gameNickname) return errors.oldAccount();

    let embed = new MessageEmbed()
      .setTitle(`${client.emojis.cache.get(config.emojis.update)} **Обновление стастистики**`)
      .setColor(config.colors.gold)
      .setDescription(`**${Utils.checkNicknameEquality(userDb, member)} • ${author}**`)
      .setFooter(`${args[0].toLowerCase()}  - Обновление статистики`, author.displayAvatarURL());

    if (userDb.last_stats_update?.getTime() + 30 * 60 * 1000 > Date.now()) {
      for (const matchType of ['solo', 'duo', 'squad'] as GameMatchType[]) {
        embed = await Utils.addOldPubgStats({
          embed,
          matchType,
          matchView: 'fpp',
          userDb,
        });
      }

      if (!embed.fields.length) {
        embed.addField(
          'PUBG • FPP',
          `Похоже, что Вы не наиграли достатно игр, чтобы Ваша статистика отображалась ¯\\_(ツ)_/¯`,
        );
      }

      const updateMsg = await channel.send(embed).catch((err) => {});
      if (!updateMsg) return;

      await updateMsg.react(client.emojis.cache.get(config.emojis.tpp)).catch((err) => {});

      const filter = (reaction: MessageReaction, user: User): boolean => {
        return (
          !user.bot &&
          afterConfig.allUpdateReactions.includes(reaction.emoji.id) &&
          user.id === author.id
        );
      };

      await InternalUtils.awaitReactionAndEdit({
        message: updateMsg,
        filter,
        embed,
        gameNickname,
        member,
      });
    } else {
      const fppRequestUrl = `https://api.pubg.com/shards/steam/players/${userDb.pubg_id}/seasons/${config.internal.offSeasonName}/ranked`;
      const fppPubgApiResponse = await axios
        .get(fppRequestUrl, {
          headers: {
            accept: 'application/vnd.api+json',
            Authorization: config.internal.pubgApiToken,
          },
        })
        .catch(console.error);

      const tppRequestUrl = `https://api.pubg.com/shards/steam/players/${userDb.pubg_id}/seasons/${config.internal.offSeasonName}`;
      const tppPubgApiResponse = await axios
        .get(tppRequestUrl, {
          headers: {
            accept: 'application/vnd.api+json',
            Authorization: config.internal.pubgApiToken,
          },
        })
        .catch(console.error);

      if (!fppPubgApiResponse || fppPubgApiResponse.status === 404 || !tppPubgApiResponse) {
        return errors.apiErrorNotFound();
      }

      if (fppPubgApiResponse.status === 429) return errors.apiTooManyRequests();

      const fakeEmbed = new MessageEmbed();
      const fppPubgData = fppPubgApiResponse.data.data;
      const tppPubgData = tppPubgApiResponse.data.data;

      for (const view of ['tpp', 'fpp']) {
        const isFpp = view === 'fpp';

        for (const type of ['solo', 'duo', 'squad']) {
          const res = await Utils.addPubgStats({
            embed: isFpp ? embed : fakeEmbed,
            matchType: type as GameMatchType,
            view: view as GameViews,
            gameNickname: gameNickname,
            pubgStatsData: isFpp ? fppPubgData : tppPubgData,
          });

          if (isFpp) embed = res;
        }
      }

      if (embed.fields.length === 0) {
        const fieldText = `Похоже, что Вы не наиграли достатно игр, чтобы Ваша статистка отображалась ¯\\_(ツ)_/¯`;
        embed.addField(`PUBG • Ranked FPP`, fieldText);
      }

      await message.member.roles.add(config.roles.stats).catch((err) => {});

      const reactMsg = await message.channel.send(embed).catch((err) => {});
      if (!reactMsg) return;

      for (const updateReact of afterConfig.allUpdateReactions) {
        if (updateReact === config.emojis.fpp) continue;
        await reactMsg.react(client.emojis.cache.get(updateReact)).catch((err) => {});
      }

      const filter = (r: MessageReaction, user: User) => {
        return !user.bot && afterConfig.allUpdateReactions.includes(r.emoji.id);
      };

      await InternalUtils.awaitReactionAndEdit({
        message: reactMsg,
        filter,
        embed,
        gameNickname,
        tppPubgData,
        fppPubgData,
        member: message.member,
      });
    }
  };
}
