export type Difficulty = 'easy' | 'medium' | 'hard';
export type Screen = 'menu' | 'game';

export type GameMode = 'solo' | 'duo' | 'trio' | 'teams';

export type PlayerId =
  | 'player1'
  | 'player2'
  | 'player3'
  | 'cpu'
  | 'teamA1'
  | 'teamA2'
  | 'teamB1'
  | 'teamB2';

export interface Move {
  id: number;
  player: PlayerId;
  label: string;
  number: number;
  sumAfter: number;
}

export interface PlayerInfo {
  id: PlayerId;
  name: string;
  isCpu: boolean;
  team?: 'A' | 'B';
}

export interface MatchConfig {
  mode: GameMode;
  difficulty: Difficulty;
  target: number;
  soundEnabled: boolean;
  dark: boolean;
}
