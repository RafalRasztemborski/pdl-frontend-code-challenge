import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Button,
  Card,
  InfoBox,
  PopUpMenu,
  Skeleton,
  Stack,
  Table,
  Tag,
  Typography,
  type PopUpMenuItem,
  type TableColumnProps,
  type TableRowData,
} from '@zvoove/unity-ui';

import { useEmployees } from '../mocked/hooks/useEmployees';
import type { Employee, EmployeeStatus } from '../mocked/types/employee';

const columns = [
  { id: 'name', label: 'employees.table.name', minWidth: '220px' },
  { id: 'vorname', label: 'employees.table.vorname', minWidth: '140px' },
  { id: 'beruf', label: 'employees.table.beruf', minWidth: '180px' },
  { id: 'telefon', label: 'employees.table.telefon', minWidth: '160px' },
  { id: 'plz', label: 'employees.table.plz', minWidth: '120px' },
  { id: 'eintritt', label: 'employees.table.eintritt', minWidth: '140px' },
  {
    id: 'ueberlassen',
    label: 'employees.table.ueberlassen',
    minWidth: '150px',
  },
  { id: 'status', label: 'employees.table.status', minWidth: '160px' },
  {
    id: 'actions',
    label: 'employees.table.actions',
    align: 'right',
    width: '88px',
  },
] as const satisfies readonly TableColumnProps[];

type EmployeeTableColumns = typeof columns;
type EmployeeTableRow = TableRowData<EmployeeTableColumns>;

const statusConfig: Record<
  EmployeeStatus,
  {
    color: 'green' | 'yellow' | 'pink' | 'steel-blue' | 'neutral';
    labelKey: string;
  }
> = {
  mitarbeiter: {
    color: 'green',
    labelKey: 'employees.status.mitarbeiter',
  },
  bewerber: {
    color: 'steel-blue',
    labelKey: 'employees.status.bewerber',
  },
  ehemalig: {
    color: 'neutral',
    labelKey: 'employees.status.ehemalig',
  },
  zukuenftig: {
    color: 'yellow',
    labelKey: 'employees.status.zukuenftig',
  },
  'bewerber-cockpit': {
    color: 'pink',
    labelKey: 'employees.status.bewerberCockpit',
  },
};

function getEmployeeName(employee: Employee): string {
  return `${employee.vorname} ${employee.nachname}`;
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

export default function Employees() {
  const { t } = useTranslation();
  const { employees, isLoading, error, refetch } = useEmployees();

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
        id: 'view',
        label: t('employees.actions.view'),
        icon: 'article',
        onClick: () => {},
      },
      {
        id: 'edit',
        label: t('employees.actions.edit'),
        icon: 'edit',
        onClick: () => {},
      },
      {
        id: 'delete',
        label: t('employees.actions.delete'),
        icon: 'delete',
        onClick: () => {},
      },
    ],
    [t],
  );

  const tableRows = useMemo<EmployeeTableRow[]>(
    () =>
      employees.map((employee) => {
        const status = statusConfig[employee.status];
        const employeeName = getEmployeeName(employee);

        return {
          name: (
            <Stack direction="row" gap="sm" align="center">
              <Avatar
                type={employee.image ? 'image' : 'initials'}
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
                  {t('employees.actions.openMenu', { name: employeeName })}
                </Button>
              </PopUpMenu>
            </Stack>
          ),
        };
      }),
    [employees, rowActions, t],
  );

  return (
    <div className="h-full overflow-auto">
      <Stack
        direction="column"
        gap="lg"
        padding={{ minimum: 'sm', tablet: 'lg' }}
      >
        <Stack
          direction={{ minimum: 'column', tablet: 'row' }}
          gap="md"
          align={{ minimum: 'stretch', tablet: 'center' }}
          justify="space-between"
          width="100%"
        >
          <Stack direction="column" gap="xs" width="100%">
            <Typography variant="headline" size="lg" as="h1">
              {t('employees.header.title')}
            </Typography>
            <Typography color="on-surface-variant" as="p">
              {t('employees.header.description')}
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            icon="refresh"
            onClick={refetch}
            disabled={isLoading}
          >
            {t('employees.actions.refresh')}
          </Button>
        </Stack>

        {error ? (
          <InfoBox
            message={t('employees.error')}
            variant="error"
            icon="warning"
          />
        ) : null}

        {isLoading ? (
          <EmployeeTableSkeleton />
        ) : (
          <Table
            columns={tableColumns}
            data={tableRows}
            emptyState={t('employees.empty')}
            headerBackgroundColor
          />
        )}
      </Stack>
    </div>
  );
}
