import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/app-layout.tsx", [
    index("routes/home.tsx"),
    route("employees", "routes/employees.tsx"),
    route("users", "routes/users.tsx"),
  ]),
] satisfies RouteConfig;
