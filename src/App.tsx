import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ISummary, UnitType, unitTypeTitle, unitsList } from "./units";
import UnitSlider from "./components/unitSlider";
import { useRef, useState } from "react";
import { useToast } from "./components/ui/use-toast";
import { ShieldIcon, SwordIcon } from "lucide-react";
import Winner from "./components/ui/winner";

function getDefaultUnitsRef() {
  return {
    attacker: {} as Partial<Record<UnitType, number>>,
    defender: {} as Partial<Record<UnitType, number>>,
    wallLevel: 0,
  };
}

function transformUnits(units: Partial<Record<UnitType, number>>) {
  return Object.keys(units).map((unitType) => {
    return {
      type: +unitType,
      amount: units[+unitType as UnitType],
      level: 1,
    };
  });
}

export default function App() {
  const unitsRef = useRef(getDefaultUnitsRef());

  const [reload, setReload] = useState(1);
  const [summary, setSummary] = useState<ISummary>();

  const { toast } = useToast();

  const handleReset = async () => {
    setSummary(undefined);
    setReload((old) => old + 1);
    unitsRef.current = getDefaultUnitsRef();
  };

  const handleAttack = async () => {
    if (
      !Object.keys(unitsRef.current.attacker).length ||
      !Object.keys(unitsRef.current.defender).length
    ) {
      return toast({
        variant: "destructive",
        description: "No units selected!",
        duration: 1000,
      });
    }
    const body = JSON.stringify({
      attacker: transformUnits(unitsRef.current.attacker),
      defender: transformUnits(unitsRef.current.defender),
      wallLevel: unitsRef.current.wallLevel,
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
  };

  return (
    <div key={reload} className="p-6 bg-slate-500 min-h-screen">
      <div className="flex gap-6 justify-center">
        <Card className="w-[380px] bg-slate-200">
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
              const losses = !unit ? undefined : unit.amount - unit.remaining;
              return (
                <UnitSlider
                  key={unitType}
                  title={title}
                  onChange={(value) => {
                    if (!value) {
                      delete unitsRef.current.attacker[unitType];
                    } else {
                      unitsRef.current.attacker[unitType] = value;
                    }
                  }}
                  max={1000}
                  step={10}
                  losses={losses}
                />
              );
            })}
          </CardContent>
        </Card>

        <Card className="w-[380px] bg-slate-200 ">
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
              const losses = !unit ? undefined : unit.amount - unit.remaining;
              return (
                <UnitSlider
                  key={unitType}
                  title={title}
                  onChange={(value) => {
                    if (!value) {
                      delete unitsRef.current.defender[unitType];
                    } else {
                      unitsRef.current.defender[unitType] = value;
                    }
                  }}
                  max={1000}
                  step={10}
                  losses={losses}
                />
              );
            })}
            <UnitSlider
              title="Wall level"
              onChange={(value) => {
                unitsRef.current.wallLevel = value;
              }}
              max={15}
              step={1}
              losses={undefined}
            />
          </CardContent>
        </Card>

        <Card className="w-[200px] bg-slate-200 self-start">
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
            <Button variant="outline" className="w-full" onClick={handleReset}>
              <ReloadIcon className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* {!!summary && <Summary summary={summary} />} */}
    </div>
  );
}
