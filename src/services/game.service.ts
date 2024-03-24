import { UnitsDataJson, unitsData as unitsDataOrig } from "@/data/unitsData";
import {
  BattleUnit,
  BattleUnitWithRemainingAmount,
  TotalsStats,
  UnitAttackCategory,
  UnitProperty,
  UnitType,
} from "@/units";

const unitAttackCategories: UnitAttackCategory[] = [
  "melee",
  "ranged",
  "cavalry",
  "siege",
];

class Unit {
  static typeAttackCategoryMap: Record<UnitType, UnitAttackCategory> = {
    [UnitType.NileSpearmen]: "melee",
    [UnitType.Slingers]: "ranged",
    [UnitType.DesertAxemen]: "melee",
    [UnitType.PharaohsBowmen]: "ranged",
    [UnitType.Chariots]: "cavalry",
    [UnitType.NubianCavalry]: "cavalry",
    [UnitType.CamelArchers]: "ranged",
    [UnitType.WarElephants]: "cavalry",
    [UnitType.SiegeTower]: "siege",
    [UnitType.Catapult]: "siege",
    [UnitType.Scout]: "melee",
    [UnitType.TunnelDiggers]: "siege",
    [UnitType.Trapper]: "melee",
    [UnitType.Caravan]: "melee",
  };

  static propertyKeys: UnitProperty[] = [
    UnitProperty.Speed,
    UnitProperty.Carry,
    UnitProperty.Attack,
    UnitProperty.Defense,
    UnitProperty.Health,
  ];

  static getUnitAttackCategory(type: UnitType): UnitAttackCategory {
    return Unit.typeAttackCategoryMap[type];
  }

  static getProperties(
    unitType: UnitType,
    level: number,
    unitsData: UnitsDataJson
  ): Record<UnitProperty, number> {
    const increaseMultiplier = Math.max(0, level - 1);
    return this.propertyKeys.reduce((acc, key) => {
      const propertyKey = key as UnitProperty;

      const build = unitsData[unitType].build;
      const value = Math.round(
        build.properties[propertyKey].base +
          increaseMultiplier * build.properties[propertyKey].increase
      );
      acc[propertyKey] = value;
      return acc;
    }, {} as Record<UnitProperty, number>);
  }
}

export class GameService {
  constructor() {}

  private _createTotalsObject(): Record<UnitAttackCategory, TotalsStats> {
    return {
      melee: { hp: 0, remainingHp: 0, attack: 0, win: 0 },
      ranged: { hp: 0, remainingHp: 0, attack: 0, win: 0 },
      cavalry: { hp: 0, remainingHp: 0, attack: 0, win: 0 },
      siege: { hp: 0, remainingHp: 0, attack: 0, win: 0 },
    };
  }

  private _getTotalAttack(
    units: BattleUnit[],
    unitsData: UnitsDataJson
  ): Record<UnitAttackCategory, TotalsStats> {
    const total = this._createTotalsObject();

    units.forEach((unit) => {
      const unitProperties = Unit.getProperties(
        unit.type,
        unit.level,
        unitsData
      );
      const hpPerUnit = unitProperties[UnitProperty.Health];
      const attackPerUnit = unitProperties[UnitProperty.Attack];

      const unitAttackCategory = Unit.getUnitAttackCategory(unit.type);

      total[unitAttackCategory].hp += hpPerUnit * unit.amount;
      total[unitAttackCategory].attack += attackPerUnit * unit.amount;
    });
    return total;
  }

  private _getTotalDefense(
    units: BattleUnit[],
    bonusDefensePerUnit: number,
    unitsData: UnitsDataJson
  ): Record<UnitAttackCategory, TotalsStats> {
    const total = this._createTotalsObject();

    units.forEach((unit) => {
      const unitProperties = Unit.getProperties(
        unit.type,
        unit.level,
        unitsData
      );
      const hpPerUnit = unitProperties[UnitProperty.Health];
      const attackPerUnit =
        unitProperties[UnitProperty.Defense] + bonusDefensePerUnit;

      const unitAttackCategory = Unit.getUnitAttackCategory(unit.type);

      total[unitAttackCategory].hp += hpPerUnit * unit.amount;
      total[unitAttackCategory].attack += attackPerUnit * unit.amount;
    });
    return total;
  }

  calculateBattle(
    attackerUnits: BattleUnit[],
    defenderUnits: BattleUnit[],
    // wallLevel: number
    wallDefenseBonus: number,
    _unitsData?: UnitsDataJson
  ) /* : {
      success: boolean;
      attackerUnits: BattleUnitWithRemainingAmount[];
      defenderUnits: BattleUnitWithRemainingAmount[];
    } */ {
    const unitsData = _unitsData ?? unitsDataOrig;

    const defenseBonus =
      //   Building.getEffects(BuildingType.Wall, wallLevel).defenseBonus ?? 0;
      wallDefenseBonus;

    const attacker = this._getTotalAttack(attackerUnits, unitsData);
    const defender = this._getTotalDefense(
      defenderUnits,
      defenseBonus,
      unitsData
    );

    // calculate win % per attack category
    unitAttackCategories.map((attackCategory) => {
      const both =
        attacker[attackCategory].attack + defender[attackCategory].attack;
      const attackerWin =
        both === 0 ? 0 : (100 * attacker[attackCategory].attack) / both;
      const defenderWin = both === 0 ? 0 : 100 - attackerWin;
      attacker[attackCategory].win = attackerWin;
      defender[attackCategory].win = defenderWin;
    });

    const attackerTotalAttack = Object.values(attacker).reduce(
      (sum, stats) => sum + stats.attack,
      0
    );
    const defenderTotalAttack = Object.values(defender).reduce(
      (sum, stats) => sum + stats.attack,
      0
    );
    // const attackerTotalHp = Object.values(attacker).reduce(
    //   (sum, stats) => sum + stats.hp,
    //   0,
    // );
    // const defenderTotalHp = Object.values(defender).reduce(
    //   (sum, stats) => sum + stats.hp,
    //   0,
    // );
    const bothTotalAttack = attackerTotalAttack + defenderTotalAttack;
    const attackerTotalWin = (100 * attackerTotalAttack) / bothTotalAttack;
    const defenderTotalWin = 100 - attackerTotalWin;

    const success = attackerTotalWin > defenderTotalWin;

    // remaining HP calculation
    unitAttackCategories.forEach((attackCategory) => {
      attacker[attackCategory].remainingHp =
        attacker[attackCategory].hp *
        (attacker[attackCategory].win / 100) *
        (attackerTotalWin / 100);

      defender[attackCategory].remainingHp =
        defender[attackCategory].hp *
        (defender[attackCategory].win / 100) *
        (defenderTotalWin / 100);
    });

    // remaining units
    const attackerRemainingUnits: BattleUnitWithRemainingAmount[] =
      attackerUnits.map((unit) => {
        const unitAttackCategory = Unit.getUnitAttackCategory(unit.type);
        const { hp, remainingHp } = attacker[unitAttackCategory];

        const remaining = Math.round(unit.amount * (remainingHp / hp));

        return {
          ...unit,
          remaining,
        };
      });

    const defenderRemainingUnits: BattleUnitWithRemainingAmount[] =
      defenderUnits.map((unit) => {
        const unitAttackCategory = Unit.getUnitAttackCategory(unit.type);
        const { hp, remainingHp } = defender[unitAttackCategory];

        const remaining = Math.round(unit.amount * (remainingHp / hp));

        return {
          ...unit,
          remaining,
        };
      });

    return {
      success,
      attackerUnits: attackerRemainingUnits,
      defenderUnits: defenderRemainingUnits,
      attacker,
      defender,
      attackerTotalWin,
      defenderTotalWin,
    };
  }

  calculateBattleV2(
    attackerUnits: BattleUnit[],
    defenderUnits: BattleUnit[],
    // wallLevel: number
    wallDefenseBonus: number,
    _unitsData?: UnitsDataJson
  ) /* : {
      success: boolean;
      attackerUnits: BattleUnitWithRemainingAmount[];
      defenderUnits: BattleUnitWithRemainingAmount[];
    } */ {
    const unitsData = _unitsData ?? unitsDataOrig;

    const defenseBonus =
      //   Building.getEffects(BuildingType.Wall, wallLevel).defenseBonus ?? 0;
      wallDefenseBonus;

    const attacker = this._getTotalAttack(attackerUnits, unitsData);
    const defender = this._getTotalDefense(
      defenderUnits,
      defenseBonus,
      unitsData
    );

    // calculate win % per attack category
    unitAttackCategories.map((attackCategory) => {
      const both =
        attacker[attackCategory].attack + defender[attackCategory].attack;
      const attackerWin =
        both === 0 ? 0 : (100 * attacker[attackCategory].attack) / both;
      const defenderWin = both === 0 ? 0 : 100 - attackerWin;
      attacker[attackCategory].win = attackerWin;
      defender[attackCategory].win = defenderWin;
    });

    const attackerTotalAttack = Object.values(attacker).reduce(
      (sum, stats) => sum + stats.attack,
      0
    );
    const defenderTotalAttack = Object.values(defender).reduce(
      (sum, stats) => sum + stats.attack,
      0
    );
    const bothTotalAttack = attackerTotalAttack + defenderTotalAttack;
    const attackerTotalWin = (100 * attackerTotalAttack) / bothTotalAttack;
    const defenderTotalWin = 100 - attackerTotalWin;

    const success = attackerTotalWin > defenderTotalWin;

    const attackerTotalHp = Object.values(attacker).reduce(
      (sum, stats) => sum + stats.hp,
      0
    );
    const defenderTotalHp = Object.values(defender).reduce(
      (sum, stats) => sum + stats.hp,
      0
    );
    const attackerRemainingHp = (attackerTotalHp * attackerTotalWin) / 100;
    const defenderRemainingHp = (defenderTotalHp * defenderTotalWin) / 100;

    // remaining HP calculation
    unitAttackCategories.forEach((attackCategory) => {
      attacker[attackCategory].remainingHp =
        (attacker[attackCategory].hp / attackerTotalHp) * attackerRemainingHp;

      defender[attackCategory].remainingHp =
        (defender[attackCategory].hp / defenderTotalHp) * defenderRemainingHp;
    });

    // remaining units
    const attackerRemainingUnits: BattleUnitWithRemainingAmount[] =
      attackerUnits.map((unit) => {
        const unitAttackCategory = Unit.getUnitAttackCategory(unit.type);
        const { hp, remainingHp } = attacker[unitAttackCategory];

        const remaining = Math.round(unit.amount * (remainingHp / hp));

        return {
          ...unit,
          remaining,
        };
      });

    const defenderRemainingUnits: BattleUnitWithRemainingAmount[] =
      defenderUnits.map((unit) => {
        const unitAttackCategory = Unit.getUnitAttackCategory(unit.type);
        const { hp, remainingHp } = defender[unitAttackCategory];

        const remaining = Math.round(unit.amount * (remainingHp / hp));

        return {
          ...unit,
          remaining,
        };
      });

    return {
      success,
      attackerUnits: attackerRemainingUnits,
      defenderUnits: defenderRemainingUnits,
      attacker,
      defender,
      attackerTotalWin,
      defenderTotalWin,
    };
  }
}

const gameService = new GameService();

export default gameService;
