import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Button,
  Card,
  Grid,
  Icon,
  InfoBox,
  List,
  ProgressIndicator,
  Skeleton,
  Stack,
  Tag,
  Typography,
  type ListItem,
} from "@zvoove/unity-ui";

import { useDashboard } from "../mocked/hooks/useDashboard";
import type {
  DashboardActivity,
  DashboardKpi,
  DashboardOnboardingStep,
  DashboardUpcomingEvent,
} from "../mocked/types/dashboard";

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useAnimatedNumber(target: number, durationMs = 700): number {
  const [value, setValue] = useState(() =>
    getPrefersReducedMotion() ? target : 0,
  );

  useEffect(() => {
    if (getPrefersReducedMotion()) {
      setValue(target);
      return;
    }

    let animationFrame = 0;
    const startedAt = performance.now();

    const tick = (time: number) => {
      const progress = Math.min((time - startedAt) / durationMs, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setValue(target * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    setValue(0);
    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [durationMs, target]);

  return value;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function DashboardSkeleton() {
  return (
    <Stack direction="column" gap="lg">
      <Skeleton height={64} borderRadius="sm" />
      <Grid
        columns={{ minimum: 1, mobile: 2, laptop: 4 }}
        gap="md"
        width="100%"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} variant="outlined" padding="md">
            <Stack direction="column" gap="md">
              <Stack direction="row" justify="space-between" align="center">
                <Skeleton width="55%" height={20} />
                <Skeleton width={40} height={40} borderRadius="full" />
              </Stack>
              <Skeleton width="45%" height={36} />
              <Skeleton width="35%" height={18} />
            </Stack>
          </Card>
        ))}
      </Grid>
      <Grid columns={{ minimum: 1, laptop: "1fr 1fr" }} gap="md" width="100%">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} variant="outlined" padding="md">
            <Stack direction="column" gap="md">
              <Skeleton width="45%" height={24} />
              <Skeleton height={52} />
              <Skeleton height={52} />
              <Skeleton height={52} />
            </Stack>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}

function buildActivityItems(
  activities: DashboardActivity[],
  t: (key: string) => string,
): ListItem[] {
  return activities.map((activity) => ({
    id: activity.id,
    content: (
      <Stack direction="row" gap="sm" align="center" width="100%">
        <Avatar
          type="initials"
          name={getInitials(activity.name)}
          size="md"
          variant="round"
        />
        <Stack direction="column" gap="xs2" width="100%">
          <Typography variant="body" size="md" as="span">
            {activity.name}
          </Typography>
          <Typography color="on-surface-variant" size="sm" as="span">
            {t(activity.actionKey)}
          </Typography>
        </Stack>
        <Typography color="on-surface-variant" size="sm" as="span">
          {t(activity.timeKey)}
        </Typography>
      </Stack>
    ),
  }));
}

function buildEventItems(
  events: DashboardUpcomingEvent[],
  t: (key: string) => string,
): ListItem[] {
  return events.map((event) => ({
    id: event.id,
    content: (
      <Stack direction="row" gap="sm" align="center" justify="space-between">
        <Stack direction="column" gap="xs2">
          <Typography variant="body" size="md" as="span">
            {t(event.titleKey)}
          </Typography>
          <Typography color="on-surface-variant" size="sm" as="span">
            {event.date}
          </Typography>
        </Stack>
        <Tag
          label={t(event.tagLabelKey)}
          color={event.tagColor}
          variant="solid"
          tone="light"
          size="sm"
        />
      </Stack>
    ),
  }));
}

function KpiCard({ index, kpi }: { index: number; kpi: DashboardKpi }) {
  const { t } = useTranslation();
  const numericValue = Number(kpi.value);
  const animatedValue = useAnimatedNumber(
    Number.isNaN(numericValue) ? 0 : numericValue,
    750,
  );
  const displayValue = Number.isNaN(numericValue)
    ? kpi.value
    : Math.round(animatedValue).toString();

  return (
    <div className="dashboard-kpi-card dashboard-stagger-item">
      <Card
        variant="outlined"
        padding="md"
        style={{ animationDelay: `${index * 70}ms` }}
      >
        <Stack direction="column" gap="md">
          <Stack direction="row" align="center" justify="space-between">
            <Typography color="on-surface-variant" as="span">
              {t(kpi.labelKey)}
            </Typography>
            <span className="dashboard-kpi-icon">
              <Icon name={kpi.icon} color={kpi.changeColor} featured />
            </span>
          </Stack>
          <Typography variant="headline" size="lg" as="p">
            {displayValue}
          </Typography>
          <Tag
            label={kpi.change}
            color={kpi.changeColor}
            variant="solid"
            tone="light"
            size="sm"
          />
        </Stack>
      </Card>
    </div>
  );
}

function AnimatedOnboardingProgress({
  item,
}: {
  item: DashboardOnboardingStep;
}) {
  const { t } = useTranslation();
  const value = useAnimatedNumber(item.value, 900);
  const roundedValue = Math.round(value);

  return (
    <Stack key={item.labelKey} direction="column" gap="xs">
      <Stack direction="row" justify="space-between" align="center">
        <Typography as="span">{t(item.labelKey)}</Typography>
        <Typography color="on-surface-variant" as="span">
          {t("dashboard.progress.value", {
            value: roundedValue,
          })}
        </Typography>
      </Stack>
      <ProgressIndicator value={roundedValue} />
    </Stack>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { dashboard, isLoading, error, refetch } = useDashboard();

  return (
    <div className="h-full overflow-auto">
      <Stack
        direction="column"
        gap="lg"
        padding={{ minimum: "sm", tablet: "lg" }}
      >
        <Stack
          direction={{ minimum: "column", tablet: "row" }}
          gap="md"
          align={{ minimum: "stretch", tablet: "center" }}
          justify="space-between"
          width="100%"
        >
          <Stack direction="column" gap="xs" width="100%">
            <Typography variant="headline" size="lg" as="h1">
              {t("dashboard.header.title")}
            </Typography>
            <Typography color="on-surface-variant" as="p">
              {t("dashboard.header.description")}
            </Typography>
          </Stack>
          <Stack direction="row" gap="sm" justify="flex-end">
            <span
              className="dashboard-refresh-action"
              data-loading={isLoading ? "true" : "false"}
            >
              <Button
                variant="outlined"
                icon="refresh"
                onClick={refetch}
                disabled={isLoading}
              >
                {t("dashboard.actions.refresh")}
              </Button>
            </span>
            <Button<typeof Link>
              variant="filled"
              icon="users"
              linkComponent={Link}
              to="/employees"
            >
              {t("dashboard.actions.employees")}
            </Button>
          </Stack>
        </Stack>

        {error ? (
          <InfoBox
            message={t("dashboard.error")}
            variant="error"
            icon="warning"
          />
        ) : null}

        {isLoading || !dashboard ? (
          <DashboardSkeleton />
        ) : (
          <>
            <InfoBox
              message={t(dashboard.announcementKey)}
              variant="subtle"
              icon="info"
            />

            <Grid
              columns={{ minimum: 1, mobile: 2, laptop: 4 }}
              gap="md"
              width="100%"
            >
              {dashboard.kpis.map((kpi, index) => (
                <KpiCard key={kpi.id} index={index} kpi={kpi} />
              ))}
            </Grid>

            <Grid
              columns={{ minimum: 1, laptop: "1fr 1fr" }}
              gap="md"
              width="100%"
            >
              <Card
                variant="outlined"
                padding="none"
                header={
                  <Stack padding="md">
                    <Typography variant="title" size="md" as="h2">
                      {t("dashboard.sections.activity")}
                    </Typography>
                  </Stack>
                }
              >
                <List
                  items={buildActivityItems(dashboard.activities, t)}
                  showDividers
                />
              </Card>

              <Card
                variant="outlined"
                padding="none"
                header={
                  <Stack padding="md">
                    <Typography variant="title" size="md" as="h2">
                      {t("dashboard.sections.upcoming")}
                    </Typography>
                  </Stack>
                }
              >
                <List
                  items={buildEventItems(dashboard.upcomingEvents, t)}
                  showDividers
                />
              </Card>

              <Grid.Item colSpan={{ minimum: 1, laptop: 2 }}>
                <Card
                  variant="outlined"
                  padding="md"
                  header={
                    <Stack padding="md">
                      <Typography variant="title" size="md" as="h2">
                        {t("dashboard.sections.onboarding")}
                      </Typography>
                    </Stack>
                  }
                >
                  <Stack direction="column" gap="md">
                    {dashboard.onboardingProgress.map((item) => (
                      <AnimatedOnboardingProgress
                        key={item.labelKey}
                        item={item}
                      />
                    ))}
                  </Stack>
                </Card>
              </Grid.Item>
            </Grid>
          </>
        )}
      </Stack>
    </div>
  );
}
