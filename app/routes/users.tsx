import { memo, useCallback, useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Button,
  Card,
  Chip,
  InfoBox,
  PopUpMenu,
  Skeleton,
  Stack,
  Table,
  Tag,
  TextField,
  Typography,
  type PopUpMenuItem,
  type TableColumnProps,
  type TableRowData,
} from "@zvoove/unity-ui";

import { useEmployees } from "../mocked/hooks/useEmployees";
import type {
  Employee,
  EmployeeFilterOption,
  EmployeeFilters,
  EmployeeStatus,
} from "../mocked/types/employee";

const columns = [
  { id: "name", label: "employees.table.name", minWidth: "220px" },
  { id: "vorname", label: "employees.table.vorname", minWidth: "140px" },
  { id: "beruf", label: "employees.table.beruf", minWidth: "180px" },
  { id: "telefon", label: "employees.table.telefon", minWidth: "160px" },
  { id: "plz", label: "employees.table.plz", minWidth: "120px" },
  { id: "eintritt", label: "employees.table.eintritt", minWidth: "140px" },
  {
    id: "ueberlassen",
    label: "employees.table.ueberlassen",
    minWidth: "150px",
  },
  { id: "status", label: "employees.table.status", minWidth: "160px" },
  {
    id: "actions",
    label: "employees.table.actions",
    align: "right",
    width: "88px",
  },
] as const satisfies readonly TableColumnProps[];

type EmployeeTableColumns = typeof columns;
type EmployeeTableRow = TableRowData<EmployeeTableColumns>;
type FilterKey = keyof EmployeeFilters;
type ActiveFilters = Partial<Record<FilterKey, string>>;

const filterKeys = [
  "beruf",
  "plz",
  "eintritt",
  "ueberlassen",
  "status",
] as const satisfies readonly FilterKey[];

const statusConfig: Record<
  EmployeeStatus,
  {
    color: "green" | "yellow" | "pink" | "steel-blue" | "neutral";
    labelKey: string;
  }
> = {
  mitarbeiter: {
    color: "green",
    labelKey: "employees.status.mitarbeiter",
  },
  bewerber: {
    color: "steel-blue",
    labelKey: "employees.status.bewerber",
  },
  ehemalig: {
    color: "neutral",
    labelKey: "employees.status.ehemalig",
  },
  zukuenftig: {
    color: "yellow",
    labelKey: "employees.status.zukuenftig",
  },
  "bewerber-cockpit": {
    color: "pink",
    labelKey: "employees.status.bewerberCockpit",
  },
};

function getEmployeeName(employee: Employee): string {
  return `${employee.vorname} ${employee.nachname}`;
}

function getFilterOptionLabel(
  filters: EmployeeFilters | null,
  filterKey: FilterKey,
  value: string | undefined,
): string | null {
  if (!value) return null;

  return (
    filters?.[filterKey].find((option) => option.value === value)?.label ?? null
  );
}

function matchesFilterOption(
  employeeValue: string,
  selectedValue: string | undefined,
  options: EmployeeFilterOption[] | undefined,
): boolean {
  if (!selectedValue) return true;

  const option = options?.find((item) => item.value === selectedValue);
  const normalizedEmployeeValue = employeeValue.toLocaleLowerCase();
  const normalizedSelectedValue = selectedValue.toLocaleLowerCase();
  const normalizedOptionLabel = option?.label.toLocaleLowerCase();

  return (
    normalizedEmployeeValue === normalizedSelectedValue ||
    normalizedEmployeeValue.includes(normalizedSelectedValue) ||
    normalizedEmployeeValue === normalizedOptionLabel
  );
}

function EmployeeTableSkeleton() {
  return (
    <Card variant="outlined" padding="md">
      <Stack direction="column" gap="md">
        {Array.from({ length: 8 }).map((_, index) => (
          <Stack key={index} direction="row" gap="md" align="center">
            <Skeleton width={40} height={40} borderRadius="full" />
            <Skeleton width="18%" height={20} />
            <Skeleton width="12%" height={20} />
            <Skeleton width="18%" height={20} />
            <Skeleton width="14%" height={20} />
            <Skeleton width="10%" height={20} />
            <Skeleton width="12%" height={24} borderRadius="full" />
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

const PageHeader = memo(function PageHeader({
  isLoading,
  onRefetch,
}: {
  isLoading: boolean;
  onRefetch: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Stack
      direction={{ minimum: "column", tablet: "row" }}
      gap="md"
      align={{ minimum: "stretch", tablet: "center" }}
      justify="space-between"
      width="100%"
    >
      <Stack direction="column" gap="xs" width="100%">
        <Typography variant="headline" size="lg" as="h1">
          {t("employees.header.title")}
        </Typography>
        <Typography color="on-surface-variant" as="p">
          {t("employees.header.description")}
        </Typography>
      </Stack>
      <Button
        variant="outlined"
        icon="refresh"
        onClick={onRefetch}
        disabled={isLoading}
      >
        {t("employees.actions.refresh")}
      </Button>
    </Stack>
  );
});

const EmployeeSearchField = memo(function EmployeeSearchField({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <TextField
      label={t("employees.filters.search")}
      placeholder={t("employees.filters.searchPlaceholder")}
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
      clearable
      icon="search"
      density="-2"
    />
  );
});

const EmployeeFilterChips = memo(function EmployeeFilterChips({
  activeFilters,
  filters,
  onFilterToggle,
}: {
  activeFilters: ActiveFilters;
  filters: EmployeeFilters | null;
  onFilterToggle: (filterKey: FilterKey, value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Stack direction="row" gap="sm" wrap="wrap">
      {filterKeys.map((filterKey) => {
        const selectedValue = activeFilters[filterKey];
        const selectedLabel = getFilterOptionLabel(
          filters,
          filterKey,
          selectedValue,
        );
        const items =
          filters?.[filterKey].map((option) => ({
            id: option.value,
            label:
              filterKey === "status"
                ? t(
                    statusConfig[option.value as EmployeeStatus]?.labelKey ??
                      option.label,
                  )
                : option.label,
          })) ?? [];

        return (
          <PopUpMenu
            key={filterKey}
            items={items}
            selectedItem={selectedValue}
            selectable="single"
            placement="bottom-left"
            onItemClick={(item) => onFilterToggle(filterKey, item.id)}
          >
            <Chip
              type="filter"
              label={
                selectedLabel
                  ? t("employees.filters.activeLabel", {
                      filter: t(`employees.filters.${filterKey}`),
                      value:
                        filterKey === "status"
                          ? t(
                              statusConfig[selectedValue as EmployeeStatus]
                                ?.labelKey ?? selectedLabel,
                            )
                          : selectedLabel,
                    })
                  : t(`employees.filters.${filterKey}`)
              }
              variant={selectedValue ? "primary" : "secondary"}
              disabled={!filters}
            />
          </PopUpMenu>
        );
      })}
    </Stack>
  );
});

function EmployeeTableSection({
  employees,
  filters,
}: {
  employees: Employee[];
  filters: EmployeeFilters | null;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  const handleFilterToggle = useCallback(
    (filterKey: FilterKey, value: string) => {
      setActiveFilters((currentFilters) => ({
        ...currentFilters,
        [filterKey]: currentFilters[filterKey] === value ? undefined : value,
      }));
    },
    [],
  );

  const tableColumns = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        label: t(column.label),
      })) as unknown as EmployeeTableColumns,
    [t],
  );

  const rowActions = useMemo<PopUpMenuItem[]>(
    () => [
      {
        id: "view",
        label: t("employees.actions.view"),
        icon: "article",
        onClick: () => {},
      },
      {
        id: "edit",
        label: t("employees.actions.edit"),
        icon: "edit",
        onClick: () => {},
      },
      {
        id: "delete",
        label: t("employees.actions.delete"),
        icon: "delete",
        onClick: () => {},
      },
    ],
    [t],
  );

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLocaleLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        employee.nachname.toLocaleLowerCase().includes(normalizedSearch) ||
        employee.vorname.toLocaleLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      return filterKeys.every((filterKey) =>
        matchesFilterOption(
          employee[filterKey],
          activeFilters[filterKey],
          filters?.[filterKey],
        ),
      );
    });
  }, [activeFilters, deferredSearch, employees, filters]);

  const filterControls = useMemo(
    () => (
      <Stack
        direction={{ minimum: "column", tablet: "row" }}
        gap="sm"
        align={{ minimum: "stretch", tablet: "center" }}
        wrap="wrap"
        width="100%"
      >
        <EmployeeSearchField search={search} onSearchChange={setSearch} />
        <EmployeeFilterChips
          activeFilters={activeFilters}
          filters={filters}
          onFilterToggle={handleFilterToggle}
        />
      </Stack>
    ),
    [activeFilters, filters, handleFilterToggle, search],
  );

  const tableRows = useMemo<EmployeeTableRow[]>(
    () =>
      filteredEmployees.map((employee) => {
        const status = statusConfig[employee.status];
        const employeeName = getEmployeeName(employee);

        return {
          name: (
            <Stack direction="row" gap="sm" align="center">
              <Avatar
                type={employee.image ? "image" : "initials"}
                image={employee.image}
                name={employeeName}
                size="md"
                variant="round"
              />
              <Typography as="span">{employee.nachname}</Typography>
            </Stack>
          ),
          vorname: employee.vorname,
          beruf: employee.beruf,
          telefon: employee.telefon,
          plz: employee.plz,
          eintritt: employee.eintritt,
          ueberlassen: employee.ueberlassen,
          status: (
            <Tag
              label={t(status.labelKey)}
              color={status.color}
              variant="solid"
              tone="light"
              size="sm"
            />
          ),
          actions: (
            <Stack direction="row" justify="flex-end">
              <PopUpMenu items={rowActions} placement="bottom-right">
                <Button icon="option" hideLabel variant="text">
                  {t("employees.actions.openMenu", { name: employeeName })}
                </Button>
              </PopUpMenu>
            </Stack>
          ),
        };
      }),
    [filteredEmployees, rowActions, t],
  );

  return (
    <Table
      title={t("employees.table.title", {
        count: filteredEmployees.length,
      })}
      columns={tableColumns}
      data={tableRows}
      filters={filterControls}
      emptyState={t("employees.empty")}
      headerBackgroundColor
    />
  );
}

export default function Users() {
  const { t } = useTranslation();
  const { employees, filters, isLoading, error, refetch } = useEmployees();

  return (
    <div className="h-full overflow-auto">
      <Stack
        direction="column"
        gap="lg"
        padding={{ minimum: "sm", tablet: "lg" }}
      >
        <PageHeader isLoading={isLoading} onRefetch={refetch} />

        {error ? (
          <InfoBox
            message={t("employees.error")}
            variant="error"
            icon="warning"
          />
        ) : null}

        {isLoading ? (
          <EmployeeTableSkeleton />
        ) : (
          <EmployeeTableSection employees={employees} filters={filters} />
        )}
      </Stack>
    </div>
  );
}
