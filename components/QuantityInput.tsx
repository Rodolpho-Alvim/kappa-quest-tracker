import React from "react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  min = 0,
  max = Infinity,
  className = "",
  disabled = false,
}) => {
  // Garantir que o valor seja sempre um número válido
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

  const handleDecrease = () => {
    if (disabled) return;
    const newValue = Math.max(min, safeValue - 1);
    onChange(newValue);
  };

  const handleIncrease = () => {
    if (disabled) return;
    const newValue = Math.min(max, safeValue + 1);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) newValue = min;
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
  };

  return (
    <div
      className={`flex items-center border rounded bg-muted ${className}`}
      style={{ width: 80, height: 32 }}
    >
      <button
        type="button"
        className="w-8 h-full flex items-center justify-center text-lg font-bold text-primary hover:bg-accent disabled:opacity-50"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        tabIndex={-1}
        aria-label="Diminuir"
      >
        -
      </button>
      <input
        type="number"
        className="w-10 text-center bg-transparent outline-none border-0 text-base font-medium hide-number-spin"
        value={safeValue}
        onChange={handleInputChange}
        min={min}
        max={max === Infinity ? undefined : max}
        disabled={disabled}
        style={{ MozAppearance: "textfield" }}
      />
      <button
        type="button"
        className="w-8 h-full flex items-center justify-center text-lg font-bold text-primary hover:bg-accent disabled:opacity-50"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        tabIndex={-1}
        aria-label="Aumentar"
      >
        +
      </button>
      <style>{`
        /* Chrome, Safari, Edge, Opera */
        input[type=number].hide-number-spin::-webkit-inner-spin-button, 
        input[type=number].hide-number-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Firefox */
        input[type=number].hide-number-spin {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};
