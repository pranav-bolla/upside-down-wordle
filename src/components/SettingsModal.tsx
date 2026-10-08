import type { Settings, Theme } from "@/lib/storage";
import Modal from "./Modal";

interface SettingsModalProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <label
      className={`flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5 ${disabled ? "" : "cursor-pointer"}`}
    >
      <span>
        <span className="block text-base font-semibold">{label}</span>
        <span className="block text-sm text-muted">{description}</span>
      </span>
      <span className="relative shrink-0">
        <input
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span className="block h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-disabled:opacity-50" />
        <span className="absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5 motion-reduce:transition-none" />
      </span>
    </label>
  );
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsModal({ settings, onChange, onClose }: SettingsModalProps) {
  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="flex flex-col gap-2.5">
        <fieldset className="rounded-2xl border border-line bg-surface px-4 py-3.5">
          <legend className="sr-only">Theme</legend>
          <span aria-hidden className="block text-base font-semibold">
            Theme
          </span>
          <span className="block text-sm text-muted">The words are upside down in all of them.</span>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-paper p-1">
            {THEME_OPTIONS.map(({ value, label }) => (
              <label key={value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  className="peer sr-only"
                  checked={settings.theme === value}
                  onChange={() => onChange({ ...settings, theme: value })}
                />
                <span className="block rounded-lg py-2 text-center text-sm font-semibold text-muted transition-colors peer-checked:bg-accent peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <ToggleRow
          label="Reduce motion"
          description="Fewer animations. The word stays upside down."
          checked={settings.reduceMotion}
          onChange={(reduceMotion) => onChange({ ...settings, reduceMotion })}
        />
        <ToggleRow
          label="Hard mode"
          description="Words appear upside down. Cannot be turned off."
          checked
          disabled
        />
      </div>
    </Modal>
  );
}
