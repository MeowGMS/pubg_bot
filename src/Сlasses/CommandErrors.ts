import { Message } from 'discord.js';
import { Utils } from '../Utils';
import { config } from '../Extends/config';

export class CommandsErrors {
  private readonly otherArgs: any[];
  private readonly message: Message;

  constructor(message: Message, ...otherArgs: any[]) {
    this.otherArgs = otherArgs;
    this.message = message;
  }

  undefinedError() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Неизвестная ошибка, обратитесь к Администрации**');
  }

  oldAccount() {
    Utils.sendToMsgChannel(
      this.message,
      `**${this.message.author.username}**, аккаунт устарел. Обновите данные аккаунта командой \`${config.internal.prefix}reg [Ваш игровой никнейм]\``,
    );
  }

  apiErrorNotFound() {
    Utils.sendToAuthor(this.message, '**\\❗ Пользователь с таким никнеймом не найден**');
  }

  apiTooManyRequests() {
    Utils.sendToAuthor(this.message, '**\\❗ Слишком много запросов, повторите попытку позже**');
  }

  userNotFound() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Пользователь не найден**');
  }

  memberNotFound() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Участник не найден**');
  }

  memberIsAlreadyBanned() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Участник уже находится в бане**');
  }

  memberHasNoBan() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Участник не забанен**');
  }

  memberHasNoMute() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Участник не замучен**');
  }

  commandNotFound() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Команда не найдена**');
  }

  noReasonSpecified() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Укажите причину**');
  }

  memberIsAlreadyMuted() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Участник уже находится в муте**');
  }

  noTimeSpecified() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Укажите время**');
  }

  wrongLfgCommand() {
    Utils.sendToAuthorDesc(
      this.message,
      `**\\❗ Команда не совпадает с типом комнаты.\n\`(Например вы используете команду ${config.internal.prefix}tpp в комнате для FPP)\`**`,
    );
  }

  authorNotInVc() {
    Utils.sendToAuthor(this.message, '**\\❗ Вы не находитесь в голосовом канале**');
  }

  notGamingCategory() {
    Utils.sendToAuthor(this.message, '**\\❗ Вы должны находтся в голосовом канале для игры**');
  }

  fullVoiceChannel() {
    Utils.sendToAuthor(
      this.message,
      '**\\❗ Вы находитесь в полном канале**\n\n*Канал не полный? Обратитесь к Staff или <@389412102860832771>*',
    );
  }

  noPermsToUse() {
    Utils.sendToMsgChannel(this.message, '**\\❗ У Вас нет прав использовать данную команду**');
  }

  memberNotInVc() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Пользователь не в голосовом канале**');
  }

  memberNotInSameVc() {
    Utils.sendToMsgChannel(
      this.message,
      '**\\❗ Пользователь не в одном голосовом канале с Вами**',
    );
  }

  needThirdMember() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Для голсования нужен третий участник пати**');
  }

  noGameNickname() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Укажите никнейм**');
  }

  registrationNotFound() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Регистрация не найдена**');
  }

  dbUserNotFound() {
    Utils.sendToMsgChannel(
      this.message,
      `**\\❗ **${this.message.author.username}**, пользователь не найден. Зарегистрируйтесь командой \`${config.internal.prefix}reg Ваш_игровой_никнейм\`**`,
    );
  }

  try_off_invise_mode() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Выйдите из режима невидимки и попробуйте снова**');
  }

  thatNicknameAlreadyExists() {
    Utils.sendToMsgChannel(
      this.message,
      `**\\❗ Пользователь с никнеймом \`${this.otherArgs[0]}\` уже сущетствует**`,
    );
  }

  author_already_in_clan() {
    Utils.sendToMsgChannel(
      this.message,
      `**\\❗ Вы состоите в клане. Используйте \`${config.internal.prefix}clan leave\` для выхода**`,
    );
  }

  cannot_create_clan() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Вы не можете создать клан**`);
  }

  no_clan_name_specified() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Укажите имя клана • Длина: \`от 3 до 25\`**`);
  }

  author_not_in_clan() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Вы не состоите в клане**`);
  }

  not_enough_time_to_extend() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Недостаточно времени для продления**`);
  }

  expired_clan() {
    Utils.sendToMsgChannel(
      this.message,
      `**\\❗ Клан просрочен. Для восстановления и продления используйте \`${config.internal.prefix}clan extend\`**`,
    );
  }

  no_clan_w_ownership() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Вы не владеете кланом**`);
  }

  no_user_clan() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Пользователь не находится в клане**`);
  }

  user_already_clan_admin() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Пользователь уже является Администратором**`);
  }

  maxClanAdmins() {
    Utils.sendToMsgChannel(this.message, `**\\❗ В клане максимальное кол-во Администраторов**`);
  }

  user_not_clan_admin() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Пользователь не является Администратором клана**`);
  }

  no_admining_clan() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Вы не являетесь Администратором клана**`);
  }

  cannot_kick_admin() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Вы не можете кикнуть Администратора клана**`);
  }

  user_is_bot() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Команду нельзя использовать на боте**`);
  }

  already_in_clan() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Пользователь уже находится в клане**`);
  }

  clan_not_enough_slots() {
    Utils.sendToMsgChannel(this.message, `**\\❗ В клане недостаточно слотов**`);
  }

  no_role_name_specified() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Укажите имя роли • Длина: \`от 3 до 25\`**`);
  }

  role_not_found() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Роль не найдена**`);
  }

  no_color_specified() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Укажите цвет в HEX (Например: \`#FFF00D\`)**`);
  }

  owner_cannot_leave_clan() {
    Utils.sendToMsgChannel(this.message, `**\\❗ Вы не можете покинуть свой клан**`);
  }

  premiumChNotFound() {
    Utils.sendToMsgChannel(this.message, '**\\❗ Premium-канал не найден**');
  }

  roomOwnerKick() {
    Utils.sendToMsgChannel(
      this.message,
      '**\\❗ Вы не можете кикнуть пользователя, вписанного в комнату**',
    );
  }
}
