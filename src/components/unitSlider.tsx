import { useState } from "react";
import { Slider } from "./ui/slider";

type Props = {
  title: string;
  onChange(value: number): void;
  max: number;
  step: number;
  losses: number | undefined;
};

const UnitSlider = ({ title, onChange, max, step, losses }: Props) => {
  const [sliderValue, setSliderValue] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold">{title}</p>

      <div className="flex gap-3">
        <Slider
          value={[sliderValue]}
          max={max}
          step={step}
          className="w-full"
          onValueChange={(values) => {
            onChange(values[0]);
            setSliderValue(values[0]);
          }}
        />
        <span className="text-sm font-bold w-10 text-right">{sliderValue}</span>

        <span className="text-sm font-bold w-20 text-red-700">
          {losses !== undefined ? `-(${losses})` : ""}
        </span>
      </div>
    </div>
  );
};

export default UnitSlider;
