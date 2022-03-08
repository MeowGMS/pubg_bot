type PunishmentTypes = 'mute' | 'ban';

type GameMatchType = 'solo' | 'duo' | 'squad';

type GameViews = 'fpp' | 'tpp';

type UpdateEmbedType = 'move' | 'connect' | 'disconnect';

type QueryUpdateType = 'voice' | 'auto';

type RankedTiers = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

type MemberEmbedInfo = {
  sameEmoji?: string;
  rankText?: string;
  registered?: string;
  allStats?: string;
};

type PubgApiData = {
  id: string;
};

interface PubgApiStatsInfo {
  kills: number;
  deaths: number;
  roundsPlayed: number;
  damageDealt: number;
  headshotKills: number;
  wins: number;
  winRatio: number;
  losses: number;
}

interface RankedStatsInfo extends PubgApiStatsInfo {
  currentTier: {
    tier: RankedTiers;
    subTier: string;
  };
  currentRankPoint: number;
}

type PubgApiStatsData = {
  attributes: {
    rankedGameModeStats: {
      solo: PubgApiStatsInfo;
      'solo-fpp': PubgApiStatsInfo;
      duo: PubgApiStatsInfo;
      'duo-fpp': PubgApiStatsInfo;
      squad: PubgApiStatsInfo;
      'squad-fpp': PubgApiStatsInfo;
    };
    gameModeStats: {
      solo: PubgApiStatsInfo;
      'solo-fpp': PubgApiStatsInfo;
      duo: PubgApiStatsInfo;
      'duo-fpp': PubgApiStatsInfo;
      squad: PubgApiStatsInfo;
      'squad-fpp': PubgApiStatsInfo;
    };
  };
};

type QueryInfo = {
  time: number;
  first: boolean;
};

type IMatchStats = {
  rankedPoints?: number;
  games?: number;
  avd?: number;
  kd?: number;
  headshots?: number;
  winRate?: number;
  wins?: number;
  rankedTier?: RankedTiers;
  rankedSubTier?: string;
};

type IViewStats = {
  solo?: IMatchStats;
  duo?: IMatchStats;
  squad?: IMatchStats;
};
