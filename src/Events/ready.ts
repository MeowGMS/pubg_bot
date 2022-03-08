import { config } from '../Extends/config';
import { client } from '../';
import { InternalUtils } from '../Utils/Internal';

client.on('ready', async () => {
  const guild = client.guilds.cache.get(config.internal.workingGuild);

  console.log(
    ` • ${client.user.tag} онлайн. Сервер ${guild ? guild.name + ' найден' : 'не найден'}`,
  );
  console.log(
    ` • Кол-во серверов: ${client.guilds.cache.size}\n\n======================================`,
  );

  await client.user
    .setActivity('личные сообщения', {
      type: 'WATCHING',
    })
    .catch((err) => {});

  if (guild) {
    setInterval(() => InternalUtils.punishCheck(guild), 60000);
    setInterval(() => InternalUtils.premCheck(guild), 35000);
    setInterval(() => InternalUtils.checkInactiveSeekings(guild), 30000);
    setInterval(() => InternalUtils.kicksCheck(guild), 31000);
    setInterval(() => InternalUtils.fetchPremMessages(guild), 5 * 60 * 1000);
    setInterval(() => InternalUtils.updateBanner(guild), 90 * 1000);

    await InternalUtils.updateBanner(guild);
    await InternalUtils.premCheck(guild);
    await InternalUtils.queryMain();
    await InternalUtils.fetchReports(guild);

    InternalUtils.fetchPremMessages(guild);

    setTimeout(() => InternalUtils.clearFreeOverwrites(guild), 3000);
  }
});
