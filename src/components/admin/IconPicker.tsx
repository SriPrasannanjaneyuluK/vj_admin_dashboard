import {
  COURSE_ICON_MAP,
  COURSE_ICON_OPTIONS,
} from "@/components/courses/CourseCard";

type IconPickerProps = {
  value: keyof typeof COURSE_ICON_MAP;
  onChange: (value: keyof typeof COURSE_ICON_MAP) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {COURSE_ICON_OPTIONS.map((option) => {
        const Icon = COURSE_ICON_MAP[option.value];
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
              selected
                ? "border-accent bg-accent/10 text-accent font-medium"
                : "border-border hover:border-accent/30"
            }`}
          >
            <Icon size={16} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
