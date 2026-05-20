interface Props {
  selected: number;
  onChange: (value: number) => void;
}

export function PresetSelector({
  selected,
  onChange,
}: Props) {

  const presets = [
    {
      label: " Estados de WhatsApp 1 min",
      value: 59,
    },

    {
      label: "Historias de Instagram 15 sg",
      value: 15,
    },

    {
      label: "YouTube Shorts 1 min",
      value: 60,
    },
  ];

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">

      {presets.map((preset) => (

        <button
          key={preset.value}
          onClick={() =>
            onChange(preset.value)
          }
          className={`
            rounded-2xl
            border
            p-4
            transition

            ${
              selected === preset.value
                ? "border-blue-500 bg-blue-500/10"
                : "border-zinc-700"
            }
          `}
        >

          {preset.label}

        </button>
      ))}

    </div>
  );
}