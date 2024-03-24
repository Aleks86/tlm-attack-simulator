import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BattleUnit,
  BattleUnitWithRemainingAmount,
  ISummary,
  UnitType,
  unitTypeTitle,
  unitsList,
} from "./units";
import UnitSlider from "./components/unitSlider";
import { useState } from "react";
import { useToast } from "./components/ui/use-toast";
import { ShieldIcon, SwordIcon, WrenchIcon } from "lucide-react";
import Winner from "./components/ui/winner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import UnitProperties from "./components/unitProperties";
import { unitsData } from "@/data/unitsData";
import { produce } from "immer";
import gameService from "./services/game.service";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";

const useServer = false;

function getDefaultUnitsNumbers() {
  return {
    attacker: {} as Partial<Record<UnitType, number>>,
    defender: {} as Partial<Record<UnitType, number>>,
    attackerLevel: {} as Partial<Record<UnitType, number>>,
    defenderLevel: {} as Partial<Record<UnitType, number>>,
    wallDefenseBonus: 0,
  };
}

function transformUnits(
  units: Partial<Record<UnitType, number>>,
  unitsLevels: Partial<Record<UnitType, number>>
): BattleUnit[] {
  return Object.keys(units).map((unitType) => {
    return {
      type: +unitType as UnitType,
      amount: units[+unitType as UnitType]!,
      level: unitsLevels[+unitType as UnitType] ?? 1,
    };
  });
}

export default function App() {
  const [unitsNumbers, setUnitsNumbers] = useState(() =>
    getDefaultUnitsNumbers()
  );

  const [reload, setReload] = useState(1);
  const [useSimulationV2, setUseSimulationV2] = useState(true);
  const [summary, setSummary] = useState<ISummary>();
  const [attackerResourcesLost, setAttackerResourcesLost] = useState<{
    wheat: number;
    wood: number;
    iron: number;
    clay: number;
  }>();
  const [defenderResourcesLost, setDefenderResourcesLost] = useState<{
    wheat: number;
    wood: number;
    iron: number;
    clay: number;
  }>();
  const [properties, setProperties] = useState(() => unitsData);

  const { toast } = useToast();

  // const handleExport = () => {
  //   console.log(JSON.stringify(properties));
  // };

  const handleReset = async () => {
    setSummary(undefined);
    setReload((old) => old + 1);
    setUnitsNumbers(getDefaultUnitsNumbers());
    setAttackerResourcesLost(undefined);
    setDefenderResourcesLost(undefined);
  };

  const handleAttack = async () => {
    if (
      !Object.keys(unitsNumbers.attacker).length ||
      !Object.keys(unitsNumbers.defender).length
    ) {
      return toast({
        variant: "destructive",
        description: "No units selected!",
        duration: 1000,
      });
    }

    const attacker = transformUnits(
      unitsNumbers.attacker,
      unitsNumbers.attackerLevel
    );
    const defender = transformUnits(
      unitsNumbers.defender,
      unitsNumbers.defenderLevel
    );
    if (useServer) {
      const body = JSON.stringify({
        attacker,
        defender,
        wallLevel: 1, //unitsNumbers.wallDefenseBonus,
      });

      const result = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!result.ok) {
        return toast({
          variant: "destructive",
          title: result.statusText,
        });
      }
      const data = await result.json();
      setSummary(data);
    } else {
      let summary;
      if (useSimulationV2) {
        summary = gameService.calculateBattleV2(
          attacker,
          defender,
          unitsNumbers.wallDefenseBonus,
          properties
        );
      } else {
        summary = gameService.calculateBattle(
          attacker,
          defender,
          unitsNumbers.wallDefenseBonus,
          properties
        );
      }
      setAttackerResourcesLost(getResourceLoss(summary.attackerUnits));
      setDefenderResourcesLost(getResourceLoss(summary.defenderUnits));

      setSummary(summary);
    }
  };

  const handleUnitAmountChange = (
    value: number,
    unitType: UnitType,
    subject:
      | "attacker"
      | "defender"
      | "attackerLevel"
      | "defenderLevel"
      | "wallDefenseBonus"
  ) => {
    setUnitsNumbers((unitNumbers) => {
      return produce(unitNumbers, (draft) => {
        if (subject === "wallDefenseBonus") {
          draft[subject] = value;
        } else {
          draft[subject][unitType] = value;
        }
      });
    });
  };

  return (
    <div key={reload} className="p-6 bg-slate-500 min-h-screen">
      <Tabs defaultValue="simulation">
        <div className="flex gap-3 items-center justify-center mb-3">
          <TabsList>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          <Switch
            id="simulation-mode"
            checked={useSimulationV2}
            onCheckedChange={(v) => setUseSimulationV2(v)}
            className="ml-5"
          />
          <Label htmlFor="simulation-mode">Simulation V2</Label>
        </div>
        <TabsContent value="simulation">
          <div className="flex gap-6 justify-center">
            <Card className="w-[450px] bg-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <SwordIcon />
                  Attacker
                  {summary?.success === true && <Winner />}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {unitsList.map((unitType) => {
                  const title = unitTypeTitle[unitType];
                  const unit = summary?.attackerUnits.find(
                    (u) => u.type === unitType
                  );
                  const losses = !unit
                    ? undefined
                    : unit.amount - unit.remaining;
                  return (
                    <UnitSlider
                      key={unitType}
                      title={title}
                      amount={unitsNumbers.attacker[unitType] ?? 0}
                      level={unitsNumbers.attackerLevel[unitType] ?? 1}
                      onChange={(value) =>
                        handleUnitAmountChange(value, unitType, "attacker")
                      }
                      onLevelChange={(value) =>
                        handleUnitAmountChange(value, unitType, "attackerLevel")
                      }
                      max={1000}
                      step={10}
                      losses={losses}
                    />
                  );
                })}
              </CardContent>
            </Card>

            <Card className="w-[450px] bg-slate-200 ">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <ShieldIcon />
                  Defender
                  {summary?.success === false && <Winner />}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {unitsList.map((unitType) => {
                  const title = unitTypeTitle[unitType];

                  const unit = summary?.defenderUnits.find(
                    (u) => u.type === unitType
                  );
                  const losses = !unit
                    ? undefined
                    : unit.amount - unit.remaining;
                  return (
                    <UnitSlider
                      key={unitType}
                      amount={unitsNumbers.defender[unitType] ?? 0}
                      level={unitsNumbers.defenderLevel[unitType] ?? 1}
                      title={title}
                      onChange={(value) =>
                        handleUnitAmountChange(value, unitType, "defender")
                      }
                      onLevelChange={(value) =>
                        handleUnitAmountChange(value, unitType, "defenderLevel")
                      }
                      max={1000}
                      step={10}
                      losses={losses}
                    />
                  );
                })}
              </CardContent>
            </Card>

            <Card className="w-[300px] bg-slate-200 self-start">
              <CardHeader>
                <CardTitle className="text-base">
                  The Last Monarchy Attack Simulator
                </CardTitle>
                <CardDescription>By Aleks</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleAttack}
                >
                  <SwordIcon className="mr-2 h-4 w-4" />
                  Attack
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  <ReloadIcon className="mr-2 h-4 w-4" />
                  Reset
                </Button>

                <UnitSlider
                  title="Wall defense bonus"
                  inputTitle="Def"
                  onChange={() => {}}
                  amount={unitsNumbers.wallDefenseBonus!}
                  level={unitsNumbers.wallDefenseBonus!}
                  onLevelChange={(value) => {
                    handleUnitAmountChange(
                      value,
                      UnitType.WarElephants,
                      "wallDefenseBonus"
                    );
                  }}
                  max={15}
                  step={1}
                  losses={undefined}
                  hideSlider
                />

                {summary && (
                  <div>
                    <p className="text-base font-bold text-center">
                      Attacker Resources lost
                    </p>
                    <p className="text-base font-bold text-center">
                      (food, wood, ores, stone)
                    </p>
                    {formatNumber(attackerResourcesLost!.wheat)} /{" "}
                    {formatNumber(attackerResourcesLost!.wood)} /{" "}
                    {formatNumber(attackerResourcesLost!.iron)} /{" "}
                    {formatNumber(attackerResourcesLost!.clay)}
                  </div>
                )}

                {summary && (
                  <div>
                    <p className="text-base font-bold text-center">
                      Defender Resources lost
                    </p>
                    <p className="text-base font-bold text-center">
                      (food, wood, ores, stone)
                    </p>
                    {formatNumber(defenderResourcesLost!.wheat)} /{" "}
                    {formatNumber(defenderResourcesLost!.wood)} /{" "}
                    {formatNumber(defenderResourcesLost!.iron)} /{" "}
                    {formatNumber(defenderResourcesLost!.clay)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="properties">
          <div className="flex gap-6 justify-center">
            <Card className="w-[500px] bg-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <WrenchIcon />
                  Units properties
                  {summary?.success === true && <Winner />}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {unitsList.map((unitType) => {
                  const title = unitTypeTitle[unitType];

                  return (
                    <UnitProperties
                      key={unitType}
                      properties={properties[unitType].build.properties}
                      title={title}
                      onChange={(_value, type, property) => {
                        setProperties((properties) => {
                          return produce(properties, (draft) => {
                            const value = _value.replace(",", ".");
                            const parsedValue =
                              value === ""
                                ? ""
                                : value.endsWith(".") || isNaN(Number(value))
                                ? value
                                : Number(value);
                            draft[unitType].build.properties[property][type] =
                              parsedValue as number;
                          });
                        });
                      }}
                    />
                  );
                })}
              </CardContent>
            </Card>

            {/* <Card className="w-[200px] bg-slate-200 self-start">
              <CardHeader>
                <CardTitle className="text-base">
                  The Last Monarchy Attack Simulator
                </CardTitle>
                <CardDescription>By Aleks</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleExport}
                >
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getResourceLoss(units: BattleUnitWithRemainingAmount[]) {
  const resources = {
    wheat: 0,
    wood: 0,
    iron: 0,
    clay: 0,
  };
  units.forEach((unit) => {
    const costPerUnit = unitsData[unit.type].build.resourcesNeeded[unit.level];
    const unitsLost = unit.amount - unit.remaining;
    resources.wheat += costPerUnit[0] * unitsLost;
    resources.wood += costPerUnit[1] * unitsLost;
    resources.iron += costPerUnit[2] * unitsLost;
    resources.clay += costPerUnit[3] * unitsLost;
  });
  return resources;
}

const formatNumber = (() => {
  const cache: { [key: number]: string } = {};

  return (number: number): string => {
    if (cache[number] !== undefined) {
      return cache[number];
    }

    const strNumber = String(number);
    const len = strNumber.length;
    let formattedNumber = "";

    for (let i = 0; i < len; i++) {
      if ((len - i) % 3 === 0 && i !== 0) {
        formattedNumber += ",";
      }
      formattedNumber += strNumber[i];
    }

    cache[number] = formattedNumber;
    return formattedNumber;
  };
})();
