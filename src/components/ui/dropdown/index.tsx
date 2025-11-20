import React from "react";
import Select, {
  components,
  type MultiValue,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import clsx from "clsx";
import DownIcon from "@src/assets/down.svg?react";

interface IOption {
  label: string;
  value: string;
  disabled?: boolean;
  render?: React.ReactNode;
}

interface IDropdownBaseProps {
  id: string;
  options: Array<IOption>;
  searchable?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
}

// Single select props
interface ISingleDropdownProps extends IDropdownBaseProps {
  multiple?: false;
  onChange?: (option: SingleValue<IOption>) => void;
  defaultValue?: string;
  value?: string;
}

// Multi select props
interface IMultiDropdownProps extends IDropdownBaseProps {
  multiple: true;
  onChange?: (options: MultiValue<IOption>) => void;
  defaultValue?: string[];
  value?: string[];
}

type DropdownProps = ISingleDropdownProps | IMultiDropdownProps;

export const Dropdown = (props: DropdownProps) => {
  const {
    id,
    label,
    multiple,
    onChange,
    defaultValue,
    value,
    options,
    searchable,
    placeholder,
    className,
  } = props;

  const styles: StylesConfig<IOption, boolean> = {
    control: (base, state) => ({
      ...base,
      minHeight: 36,
      height: 36,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderColor: state.isFocused
        ? "rgba(99,102,241,0.75)"
        : "rgba(148,163,184,0.24)",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(99,102,241,0.25)" : "none",
      borderRadius: 8,
      cursor: "pointer",
      ":hover": {
        borderColor: state.isFocused
          ? "rgba(99,102,241,0.75)"
          : "rgba(148,163,184,0.35)",
      },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 8px" }),
    placeholder: (base) => ({ ...base, color: "#94a3b8" }),
    singleValue: (base) => ({ ...base, color: "#e2e8f0" }),
    input: (base) => ({ ...base, color: "#e2e8f0" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#0f172a",
      border: "1px solid rgba(148,163,184,0.24)",
      borderRadius: 8,
      overflow: "hidden",
      zIndex: 10,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(99,102,241,0.22)"
        : state.isFocused
        ? "rgba(255,255,255,0.06)"
        : "transparent",
      color: state.isDisabled ? "#94a3b8" : "#e2e8f0",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgba(99,102,241,0.18)",
    }),
    multiValueLabel: (base) => ({ ...base, color: "#e2e8f0" }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#e2e8f0",
      ":hover": { backgroundColor: "transparent", color: "#fff" },
    }),
  };

  const DropdownIndicator = (p: any) => (
    <components.DropdownIndicator {...p}>
      <DownIcon width={16} height={16} />
    </components.DropdownIndicator>
  );

  const isMulti = !!multiple;

  const findByValue = (val?: string) =>
    options.find((o) => o.value === val) || null;

  const mapValueToOption = (val?: string | string[]) => {
    if (isMulti) {
      const vals = Array.isArray(val) ? val : val ? [val] : [];
      return vals.map((v) => findByValue(v)).filter(Boolean) as IOption[];
    }
    return findByValue(Array.isArray(val) ? val[0] : val);
  };

  const formatOptionLabel = (option: IOption) => option.render ?? option.label;

  // Type predicate to narrow MultiValue
  const isMultiValue = (val: unknown): val is MultiValue<IOption> => {
    return Array.isArray(val);
  };

  // Type predicate to narrow SingleValue
  const isSingleValue = (val: unknown): val is SingleValue<IOption> => {
    return !Array.isArray(val);
  };

  const handleChange = (sel: MultiValue<IOption> | SingleValue<IOption>) => {
    if (!onChange) return;
    if (props.multiple === true && isMultiValue(sel)) {
      props.onChange?.(sel);
    } else if (props.multiple !== true && isSingleValue(sel)) {
      props.onChange?.(sel);
    }
  };

  return (
    <div className={clsx("inline-flex flex-col gap-1 w-full", className)}>
      {label && (
        <label className="fs-1 mb-1 text-slate-400" htmlFor={id}>
          {label}
        </label>
      )}
      <Select
        inputId={id}
        instanceId={id}
        classNamePrefix="rs"
        isClearable={false}
        isSearchable={!!searchable}
        isMulti={isMulti}
        options={options}
        placeholder={placeholder}
        onChange={handleChange}
        value={mapValueToOption(value)}
        defaultValue={mapValueToOption(defaultValue)}
        styles={styles}
        components={{ DropdownIndicator }}
        formatOptionLabel={formatOptionLabel as any}
        menuPortalTarget={document?.body}
      />
    </div>
  );
};
