export enum UnitType {
  // infantry
  NileSpearmen = 10,
  Slingers = 20,
  DesertAxemen = 30,
  PharaohsBowmen = 40,
  // cavalry
  Chariots = 100,
  NubianCavalry = 110,
  CamelArchers = 120,
  WarElephants = 130,
  // siege
  SiegeTower = 200,
  Catapult = 210,
  Scout = 220,
  TunnelDiggers = 230,
  // utility
  Trapper = 300,
  // market
  Caravan = 400,
}

export const unitTypeTitle: Record<UnitType, string> = {
  // infantry
  [UnitType.NileSpearmen]: "Nile Spearmen",
  [UnitType.Slingers]: "Slingers",
  [UnitType.DesertAxemen]: "Desert Axemen",
  [UnitType.PharaohsBowmen]: "Pharaohs Bowmen",
  // cavalry
  [UnitType.Chariots]: "Chariots",
  [UnitType.NubianCavalry]: "Nubian Cavalry",
  [UnitType.CamelArchers]: "Camel Archers",
  [UnitType.WarElephants]: "War Elephants",
  // siege
  [UnitType.SiegeTower]: "Siege Tower",
  [UnitType.Catapult]: "Catapult",
  [UnitType.Scout]: "Scout",
  [UnitType.TunnelDiggers]: "Tunnel Diggers",
  // utility
  [UnitType.Trapper]: "Trapper",
  // market
  [UnitType.Caravan]: "Caravan",
};

export const unitsList: UnitType[] = [
  UnitType.NileSpearmen,
  UnitType.Slingers,
  UnitType.DesertAxemen,
  UnitType.PharaohsBowmen,
  UnitType.Chariots,
  UnitType.NubianCavalry,
  UnitType.CamelArchers,
  UnitType.WarElephants,
  UnitType.SiegeTower,
  UnitType.Catapult,
  UnitType.Scout,
  UnitType.TunnelDiggers,
  // UnitType.Trapper,
  // UnitType.Caravan,
];

export type BattleUnit = {
  type: UnitType;
  amount: number;
  level: number;
};

export type BattleUnitWithRemainingAmount = BattleUnit & {
  remaining: number;
};

export type TotalsStats = {
  /** total hp of all units of same attack category */
  hp: number;
  /** remaining hp of all units of same attack category */
  remainingHp: number;
  /** total attack of all units of same attack category */
  attack: number;
  /** in percentage */
  win: number;
};

export type UnitAttackCategory = "melee" | "ranged" | "cavalry" | "siege";

export const unitAttackCategories: UnitAttackCategory[] = [
  "melee",
  "ranged",
  "cavalry",
  "siege",
];

export type ISummary = {
  success: boolean;
  attackerUnits: BattleUnitWithRemainingAmount[];
  defenderUnits: BattleUnitWithRemainingAmount[];

  attacker: Record<UnitAttackCategory, TotalsStats>;
  defender: Record<UnitAttackCategory, TotalsStats>;
  attackerTotalWin: number;
  defenderTotalWin: number;
};

export enum UnitProperty {
  Speed = 10,
  Carry = 20,
  Attack = 30,
  Defense = 40,
  Health = 50,
}
