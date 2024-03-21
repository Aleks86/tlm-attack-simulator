import { Slider } from "./ui/slider";
import { Input } from "./ui/input";

type Props = {
  title: string;
  inputTitle?: string;
  amount: number;
  level: number;
  onChange(value: number): void;
  onLevelChange(value: number): void;
  max: number;
  step: number;
  losses: number | undefined;
  hideSlider?: boolean;
};

const UnitSlider = ({
  title,
  inputTitle = "lvl",
  amount,
  level,
  onChange,
  onLevelChange,
  max,
  step,
  losses,
  hideSlider = false,
}: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-center">{title}</p>

      <div className="flex gap-3 items-center">
        <p className="text-sm font-bold">{inputTitle}</p>
        <div className="grid w-[80px] shrink-0 items-center gap-1.5">
          <Input
            type="number"
            id="lvl"
            placeholder="lvl"
            value={level}
            max={10}
            min={1}
            onChange={(e) => onLevelChange(+e.target.value)}
          />
        </div>

        {!hideSlider && (
          <>
            <Slider
              value={[amount]}
              max={max}
              step={step}
              className="flex"
              onValueChange={(values) => {
                onChange(values[0]);
              }}
            />
            <span className="text-sm font-bold w-10 text-right shrink-0 ">
              {amount}
            </span>

            <span className="text-sm font-bold w-12 text-red-700 shrink-0 ">
              {losses !== undefined ? `-(${losses})` : ""}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default UnitSlider;
