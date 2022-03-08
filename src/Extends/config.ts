export const config = {
  internal: {
    discordAuth: '',
    pubgApiToken: '',
    offSeasonName: 'division.bro.official.pc-2018-10',
    workingGuild: '295477401813647360',
    prefix: '!',

    bannerX: {
      voice: {
        1: 220,
        2: 195,
        3: 180,
        default: 210,
      },
      members: {
        4: 170,
        5: 155,
        default: 135,
      },
    },
  },

  timings: {
    errorAutodelete: 5 * 1000,
    queryUpdateInterval: 4 * 60 * 60 * 1000,
    queryInterval: 8 * 1000,
  },

  consts: {
    freeChannels: 10,
    freeDuoChannels: 5,
    updatePriority: {
      voice: 1,
      auto: 0,
    },
    maxClanMembers: 30,
    maxClanAdmins: 5,
  },

  rates: {
    premCD: 15 * 1000,
    userCD: 30 * 1000,
  },

  roles: {
    ban: '466894325737848833',
    mute: '602838166071934996',
    premium: '438369252995629057',
    premiumPlus: '540238048814956555',
    stats: '541242943936135188',
    media: '296735481960595457',
    nitroBooster: '588145073317871667',
    liveStream: '439925107088162816',
    moderator: '327431012533403658',
    grandModerator: '319465519122087948',
  },

  channels: {
    category: {
      premium: '592928198208258068',
      fppAdr: '601121932867272734',
      tppAdr: '786358990833582090',
      custom: '620153581986906152',
      information: '596339620313038848',
      functionality: '592919268111417364',
      community: '592915512510382101',
      tournament: '477573275258454026',
      afk: '592933116994256896',
      ranked: '786366670934638632',
    },

    text: {
      premiumMenu: '541336645211783208',
      lfg: '597505247534907393',
      voiceLogs: '597505591916888075',
      playersStats: '596335101747658763',
      topMoments: '596325746100666388',
      yourPC: '611998354133614607',
      rolesLogs: '603677573771296854',
      enterExit: '596333333776957450',
      modLogs: '438330907464564736',
      report: '597507611814002752',
      reportLogs: '578926855382368266',
      dmLogs: '696032466254823485',
      msgsLogs: '696034570310647878',
    },

    voice: {
      freeFppSquad: '606041670617661441',
      freeTppSquad: '789379020650184722',
      freeDuo: '606041409232830475',

      fppSquads: ['592916698491912218'],
      tppSquads: ['593027009454800897'],

      duos: ['592916713847390218'],
    },
  },

  rankRoleNames: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'],

  colors: {
    full: '#202225',
    invisible: '#36393E',
    red: '#ee2222',
    gold: '#ffb933',
    green: '#11DD33',
    lightGreen: '#33bb66',
    blue: '#0090ff',
  },

  emojis: {
    lfgInfo: {
      tpp: {
        sameNickname: '607162839160979474',
        info: '607162839291002890',
      },
      fpp: {
        sameNickname: '606501330701516820',
        info: '606501330567168010',
      },
      premium: {
        sameNickname: '606501877214871552',
        info: '606501877206482953',
      },
    },

    unranked: '596648705118175242',
    bronze: '778427311011004467',
    silver: '778427311007072297',
    gold: '778427311291891722',
    platinum: '778427311640412180',
    diamond: '778427311111929856',
    master: '778427311246540821',

    ban: '591146107338358785',
    checkmark: '597105705601728522',
    telegram: '597105706583195649',
    deny: '597105705790472215',
    noRegistration: '597843371880349696',
    sameNickname: '564342159483076608',
    sameNicknameOff: '564344806101352470',
    infoRegistered: '564343855281995787',
    infoRegisteredOff: '564318730159652864',

    fpp: '596697023965691942',
    tpp: '596697023978274843',

    premStats: '541257256604401675',
    adrLimit: '540224582158778412',
    banPow: '310699790235205632',
    steam: '596769446396166154',

    aPremium: '552739222684172288',
    aCheckmark: '596329093167972362',

    comment: '552214831826993162',
    limitation: '552214831722135552',

    stats: '596651174266929162',
    headshots: '552214831667740683',
    damage: '564320066447867904',
    update: '554333139091193856',
    place: '596752685173047296',
    games: '596944506125942794',
    kd: '597498989264502785',
    winRate: '637317004814188565',
  },
  messages: {
    premium: '791193920868319242',
    premiumPlus: '791193931173330944',
  },

  images: {
    invisible:
      'https://cdn.discordapp.com/attachments/596260124528476171/662179916678168578/invisible.png',
    full: 'https://cdn.discordapp.com/attachments/702144959448612875/789930941845864478/FULL.gif',

    adr: {
      tpp: {
        100: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789931012799987732/TPP-SQUAD-100.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789931012799987732/TPP-SQUAD-100.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789931012799987732/TPP-SQUAD-100.gif',
        },
        150: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789931014469320723/TPP-SQUAD-150.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789931014469320723/TPP-SQUAD-150.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789931014469320723/TPP-SQUAD-150.gif',
        },
        200: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789931013182324786/TPP-SQUAD-200.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789931013182324786/TPP-SQUAD-200.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789931013182324786/TPP-SQUAD-200.gif',
        },
        250: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789931017091284992/TPP-SQUAD-250.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789931017091284992/TPP-SQUAD-250.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789931017091284992/TPP-SQUAD-250.gif',
        },
        300: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789931014931087460/TPP-SQUAD-300.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789931014931087460/TPP-SQUAD-300.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789931014931087460/TPP-SQUAD-300.gif',
        },
        350: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789931018810294322/TPP-SQUAD-350.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789931018810294322/TPP-SQUAD-350.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789931018810294322/TPP-SQUAD-350.gif',
        },
        400: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789931018165157908/TPP-SQUAD-400.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789931018165157908/TPP-SQUAD-400.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789931018165157908/TPP-SQUAD-400.gif',
        },
      },
      fpp: {
        100: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930853899567112/FPP-SQUAD-RANKED-100.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930853899567112/FPP-SQUAD-RANKED-100.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930853899567112/FPP-SQUAD-RANKED-100.gif',
        },
        150: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930851945152562/FPP-SQUAD-RANKED-150.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930851945152562/FPP-SQUAD-RANKED-150.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930851945152562/FPP-SQUAD-RANKED-150.gif',
        },
        200: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930855891599370/FPP-SQUAD-RANKED-200.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930855891599370/FPP-SQUAD-RANKED-200.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930855891599370/FPP-SQUAD-RANKED-200.gif',
        },
        250: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930858370301962/FPP-SQUAD-RANKED-250.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930858370301962/FPP-SQUAD-RANKED-250.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930858370301962/FPP-SQUAD-RANKED-250.gif',
        },
        300: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930857997402192/FPP-SQUAD-RANKED-300.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930857997402192/FPP-SQUAD-RANKED-300.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930857997402192/FPP-SQUAD-RANKED-300.gif',
        },
        350: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930857330376754/FPP-SQUAD-RANKED-350.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930857330376754/FPP-SQUAD-RANKED-350.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930857330376754/FPP-SQUAD-RANKED-350.gif',
        },
        400: {
          1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930859637637164/FPP-SQUAD-RANKED-400.gif',
          2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930859637637164/FPP-SQUAD-RANKED-400.gif',
          3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930859637637164/FPP-SQUAD-RANKED-400.gif',
        },
      },
    },
    premium: {
      fpp: {
        1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930719342362654/FPP-PREMIUM.gif',
        2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930719342362654/FPP-PREMIUM.gif',
        3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930719342362654/FPP-PREMIUM.gif',
      },
      ranked_fpp: {
        1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930147474178068/FPP-RANKED-PREMIUM.gif',
        2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930147474178068/FPP-RANKED-PREMIUM.gif',
        3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930147474178068/FPP-RANKED-PREMIUM.gif',
      },

      tpp: {
        1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930147792027658/TPP-PREMIUM.gif',
        2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930147792027658/TPP-PREMIUM.gif',
        3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930147792027658/TPP-PREMIUM.gif',
      },
      ranked_tpp: {
        1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930151780810772/TPP-RANKED-PREMIUM.gif',
        2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930151780810772/TPP-RANKED-PREMIUM.gif',
        3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930151780810772/TPP-RANKED-PREMIUM.gif',
      },
    },

    ranked_tpp: {
      4: {
        '++':
          'https://cdn.discordapp.com/attachments/596260124528476171/780808146406211614/TPP-SQUAD-RANKED-NO-ADR.gif',
        1: 'https://cdn.discordapp.com/attachments/596260124528476171/780808146406211614/TPP-SQUAD-RANKED-NO-ADR.gif',
        2: 'https://cdn.discordapp.com/attachments/596260124528476171/780808146406211614/TPP-SQUAD-RANKED-NO-ADR.gif',
        3: 'https://cdn.discordapp.com/attachments/596260124528476171/780808146406211614/TPP-SQUAD-RANKED-NO-ADR.gif',
      },
    },
    tpp: {
      4: {
        '++':
          'https://cdn.discordapp.com/attachments/702144959448612875/789931021092519938/TPP-SQUAD-PUBLIC.gif',
        1: 'https://cdn.discordapp.com/attachments/702144959448612875/789931021092519938/TPP-SQUAD-PUBLIC.gif',
        2: 'https://cdn.discordapp.com/attachments/702144959448612875/789931021092519938/TPP-SQUAD-PUBLIC.gif',
        3: 'https://cdn.discordapp.com/attachments/702144959448612875/789931021092519938/TPP-SQUAD-PUBLIC.gif',
      },
      2: {
        '++':
          'https://cdn.discordapp.com/attachments/702144959448612875/789931009445068810/TPP-DUO-PUBLIC.gif',
        1: 'https://cdn.discordapp.com/attachments/702144959448612875/789931009445068810/TPP-DUO-PUBLIC.gif',
      },
    },

    ranked_fpp: {
      4: {
        '++':
          'https://cdn.discordapp.com/attachments/702144959448612875/789930850280013824/FPP-SQUAD-RANKED.gif',
        1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930850280013824/FPP-SQUAD-RANKED.gif',
        2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930850280013824/FPP-SQUAD-RANKED.gif',
        3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930850280013824/FPP-SQUAD-RANKED.gif',
      },
    },
    fpp: {
      2: {
        '++':
          'https://cdn.discordapp.com/attachments/702144959448612875/789930849578778714/FPP-DUO.gif',
        1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930849578778714/FPP-DUO.gif',
      },
      4: {
        '++':
          'https://cdn.discordapp.com/attachments/702144959448612875/789930850279620618/FPP-SQUAD-PUBLIC.gif',
        1: 'https://cdn.discordapp.com/attachments/702144959448612875/789930850279620618/FPP-SQUAD-PUBLIC.gif',
        2: 'https://cdn.discordapp.com/attachments/702144959448612875/789930850279620618/FPP-SQUAD-PUBLIC.gif',
        3: 'https://cdn.discordapp.com/attachments/702144959448612875/789930850279620618/FPP-SQUAD-PUBLIC.gif',
      },
    },
  },
};

export const afterConfig = {
  canDeleteReg: [config.roles.grandModerator, config.roles.moderator],

  notVoicePing: [config.roles.moderator, config.roles.grandModerator],

  allUpdateReactions: [config.emojis.fpp, config.emojis.tpp],

  canUseBan: [config.roles.moderator, config.roles.grandModerator],

  canUseMute: [config.roles.moderator, config.roles.grandModerator],

  liveStreamRoles: [config.roles.media],

  customGameRooms: [config.channels.category.fppAdr, config.channels.category.tppAdr],

  canGivePremium: [config.roles.moderator, config.roles.grandModerator],

  seekingIgnoreList: [
    config.channels.category.information,
    config.channels.category.functionality,
    config.channels.category.community,
    config.channels.category.tournament,
    config.channels.category.afk,
  ],

  aCheckMarkChannels: [config.channels.text.yourPC, config.channels.text.topMoments],

  ranksObj: {
    Bronze: config.emojis.bronze,
    Silver: config.emojis.silver,
    Gold: config.emojis.gold,
    Platinum: config.emojis.platinum,
    Diamond: config.emojis.diamond,
    Master: config.emojis.master,

    unranked: config.emojis.unranked,
  },

  openedChannelsObj: {
    [config.channels.category.fppAdr]: 1,
    [config.channels.category.tppAdr]: 1,
    [config.channels.category.custom]: 1,
  },
};
