import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputNumericoMobileProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  autoFocus?: boolean;
}

export function InputNumericoMobile({
  label,
  value,
  onChange,
  placeholder = "0",
  prefix,
  autoFocus = false
}: InputNumericoMobileProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
            onChange(val);
          }}
          placeholder={placeholder}
          className={`h-12 text-xl font-bold text-center border-2 ${
            prefix ? "pl-10" : ""
          }`}
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
}