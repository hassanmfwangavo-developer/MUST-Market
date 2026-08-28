import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/msosi")({
  component: () => <Outlet />,
});
