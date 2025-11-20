import React from "react";
import Select, {
  components,
  type MultiValue,
  type StylesConfig,
  type GroupBase,
  type OptionProps,
  ActionMeta,
} from "react-select";
import clsx from "clsx";
import DownIcon from "@src/assets/down.svg?react";
import { TagNode } from "@src/store/type";

type TagOption = {
  value: string;
  label: string; // full path string (for filtering)
  pathSegments: string[];
};

export type CategorySelectProps = {
  id: string;
  label?: string;
  categories: Record<string, TagNode>;
  value?: string[];
  defaultValue?: string[];
  onChange?: (actionMeta: ActionMeta<TagOption>) => void;
  placeholder?: string;
  className?: string;
  /** If path depth is > 3, show "A / B / ... / Z". */
  collapseAfterThree?: boolean;
};

function flattenCategories(
  nodes: Record<string, TagNode> | undefined,
  ancestors: string[] = []
): TagOption[] {
  if (!nodes) return [];
  const options: TagOption[] = [];

  for (const node of Object.values(nodes)) {
    const path = [...ancestors, node.name];
    options.push({
      value: node.id,
      label: node.name,
      pathSegments: path,
    });
    options.push(...flattenCategories(node.children, path));
  }
  return options;
}

function collapsedSegments(segments: string[]) {
  if (segments.length <= 3) return segments;
  return [segments[0], segments[1], "…", segments[segments.length - 1]];
}

export function CategorySelect(props: CategorySelectProps) {
  const { id, label, categories, value, onChange, placeholder, className } =
    props;

  const options = React.useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  const styles: StylesConfig<TagOption, true> = {
    control: (base, state) => ({
      ...base,
      minHeight: 45,
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
      paddingTop: 8,
      paddingBottom: 8,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgba(34,197,94,0.18)", // green-ish
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

  const Option = (p: OptionProps<TagOption, true, GroupBase<TagOption>>) => {
    return (
      <components.Option {...p}>
        <div className="flex items-start gap-2">
          <span
            className={clsx(
              "inline-flex h-4 w-4 rounded-sm border",
              p.isSelected
                ? "bg-green-600 border-green-500"
                : "bg-transparent border-slate-500"
            )}
          />
          <div className="flex flex-col">{p.children}</div>
        </div>
      </components.Option>
    );
  };

  const formatOptionLabel = (opt: TagOption) => {
    const collapsed = collapsedSegments(opt.pathSegments);
    return (
      <div className="flex flex-col">
        <div className="text-slate-100">{opt.label}</div>
        <div className="fs-1 text-slate-400 mt-1">
          Path: {collapsed.join(" ⇒ ")}
        </div>
      </div>
    );
  };

  const mapIdsToOptions = React.useCallback(
    (ids?: string[]) => {
      const set = new Set(ids || []);
      return options.filter((o) => set.has(o.value));
    },
    [options]
  );

  const handleChange = (
    _: MultiValue<TagOption>,
    actionMeta: ActionMeta<TagOption>
  ) => {
    onChange?.(actionMeta);
  };

  return (
    <div className={clsx("inline-flex flex-col gap-1 w-full", className)}>
      {label ? (
        <label className="fs-1 mb-1 text-slate-400" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <Select
        inputId={id}
        instanceId={id}
        classNamePrefix="rs"
        isClearable={false}
        isSearchable
        isMulti
        options={options}
        placeholder={placeholder}
        onChange={handleChange}
        value={mapIdsToOptions(value)}
        styles={styles}
        components={{ DropdownIndicator, Option }}
        formatOptionLabel={formatOptionLabel}
        menuPortalTarget={document?.body}
        filterOption={(opt, rawInput) => {
          // Keep default fuzzy filter semantics, but ensure we match against full path string.
          const hay = opt.data.label.toLowerCase();
          const needle = (rawInput || "").toLowerCase();
          return hay.includes(needle);
        }}
      />
    </div>
  );
}

export default CategorySelect;
