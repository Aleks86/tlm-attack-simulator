import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "./ui/separator";
import { UnitProperty } from "@/units";

type Props = {
  properties: Record<
    UnitProperty,
    {
      base: number;
      increase: number;
    }
  >;
  title: string;
  onChange(
    value: string,
    type: "base" | "increase",
    property: UnitProperty
  ): void;
};

const propertiesList = [
  UnitProperty.Health,
  UnitProperty.Attack,
  UnitProperty.Defense,
];

const propertyLabel = {
  [UnitProperty.Health]: "hp",
  [UnitProperty.Attack]: "attack",
  [UnitProperty.Defense]: "defense",
};

const UnitProperties = ({ properties, title, onChange }: Props) => {
  const base = {
    hp: properties[UnitProperty.Health].base,
    attack: properties[UnitProperty.Attack].base,
    defense: properties[UnitProperty.Defense].base,
  };
  const increase = {
    hp: properties[UnitProperty.Health].increase,
    attack: properties[UnitProperty.Attack].increase,
    defense: properties[UnitProperty.Defense].increase,
  };

  return (
    <div className="grid gap-1">
      <div className="flex gap-3 items-center justify-end">
        <span className="text-sm font-bold w-[120px] text-right mr-2">
          {title}
        </span>
        {propertiesList.map((property) => {
          // @ts-expect-error asofs
          const p = propertyLabel[property];
          return (
            <div
              key={p}
              className="grid w-[100px] max-w-sm items-center gap-1.5"
            >
              <Label htmlFor={p}>base {p}</Label>
              <Input
                type="number"
                id={p}
                placeholder={p}
                // @ts-expect-error eee
                value={base[p]}
                onChange={(e) => onChange(e.target.value, "base", property)}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 items-center  justify-end">
        {propertiesList.map((property) => {
          // @ts-expect-error asofs
          const p = propertyLabel[property];

          return (
            <div
              key={p}
              className="grid w-[100px] max-w-sm items-center gap-1.5"
            >
              <Label htmlFor={p}>+{p} / lvl</Label>
              <Input
                // type="number"
                id={p}
                placeholder={p}
                // @ts-expect-error eee
                value={increase[p]}
                onChange={(e) => onChange(e.target.value, "increase", property)}
              />
            </div>
          );
        })}
      </div>
      <Separator className="bg-slate-400" />
    </div>
  );
};

export default UnitProperties;
