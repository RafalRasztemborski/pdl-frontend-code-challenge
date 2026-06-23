import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import {
  Breadcrumbs,
  Card,
  Grid,
  SideNavigation,
  Stack,
  Typography,
  UserArea,
  ZvooveBrand,
  type BreadcrumbsItem,
  type ListMenuItem,
} from "@zvoove/unity-ui";

import { useSharedUserArea } from "./useSharedUserArea";
import { useSidebarOpen } from "./useSidebarOpen";

function getActiveItemId(
  pathname: string,
  menuItems: ListMenuItem<typeof Link>[],
): string {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/users")) return "users";

  const firstSlug = pathname.split("/")[1] || "";
  return menuItems.find((item) => item.id === firstSlug)?.id ?? "home";
}

function getBreadcrumbItems(
  pathname: string,
  t: (key: string) => string,
): BreadcrumbsItem<typeof Link>[] {
  if (pathname === "/" || pathname === "") {
    return [{ label: t("nav.home"), to: "/" }];
  }

  if (pathname.startsWith("/users")) {
    return [
      { label: t("nav.home"), to: "/" },
      { label: t("nav.users"), to: "/users" },
    ];
  }

  return [{ label: t("nav.home"), to: "/" }];
}

function formatHeaderDate(date: Date, language: string): string {
  return new Intl.DateTimeFormat(language, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation();
  const sharedUserArea = useSharedUserArea();
  const [isOpen, setIsOpen] = useSidebarOpen();
  const { pathname } = useLocation();

  const menuItems = [
    { label: t("nav.home"), id: "home", icon: "home", to: "/" },
    {
      label: t("nav.users"),
      id: "users",
      icon: "users",
      to: "/users",
    },
  ] as ListMenuItem<typeof Link>[];

  const breadcrumbItems = getBreadcrumbItems(pathname, t);
  const activeItem = getActiveItemId(pathname, menuItems);

  return (
    <div className="h-dvh bg-background grid grid-rows-[48px_1fr] tablet:flex tablet:flex-col w-full">
      <div className="h-[48px] pl-[38px] pr-sm flex items-center justify-between tablet:hidden">
        <div className="flex items-center gap-xs">
          <ZvooveBrand iconSize={18} nameHeight={10} />
        </div>
        <div className="flex items-center gap-xs h-full">
          <UserArea
            name={sharedUserArea?.name ?? ""}
            subtitle={sharedUserArea?.subtitle}
            avatar={sharedUserArea?.avatar ?? { image: "" }}
            menuItems={sharedUserArea?.menuItems}
            infoPosition="left"
            menuPlacement="bottom-right"
            compact
          />
        </div>
      </div>
      <Grid
        columns={{ minimum: 1, tablet: "auto 1fr" }}
        gap="sm"
        padding={{
          minimum: { top: "none", bottom: "xs", left: "xs", right: "xs" },
          tablet: "sm",
        }}
        height={{ minimum: "calc(100dvh - 48px)", tablet: "100vh" }}
      >
        <SideNavigation
          linkComponent={Link}
          addBorderToToggleButton
          menuItems={menuItems}
          activeItem={activeItem}
          variant="compact"
          open={isOpen}
          userArea={sharedUserArea}
          onToggleOpen={setIsOpen}
        />
        <div className="overflow-hidden">
          <Card
            overflow="hidden"
            padding="none"
            height="100%"
            width="100%"
            variant="outlined"
            header={
              <Stack
                direction="row"
                gap="sm"
                align="center"
                justify="space-between"
                padding={{
                  minimum: "sm",
                  tablet: {
                    top: "sm",
                    bottom: "sm",
                    left: isOpen ? "sm" : "xl4",
                    right: "sm",
                  },
                }}
              >
                <Breadcrumbs
                  homeIcon="home"
                  items={breadcrumbItems}
                  linkComponent={Link}
                />
                <Stack
                  direction="row"
                  gap="md"
                  align="center"
                  justify="flex-end"
                  width="fit-content"
                >
                  <Typography color="on-surface-variant" as="span">
                    {formatHeaderDate(new Date(), i18n.language)}
                  </Typography>
                </Stack>
              </Stack>
            }
          >
            {children}
          </Card>
        </div>
      </Grid>
    </div>
  );
};

export default Layout;
