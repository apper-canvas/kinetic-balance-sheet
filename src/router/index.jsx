import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load all pages
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Transactions = lazy(() => import("@/components/pages/Transactions"));
const Budgets = lazy(() => import("@/components/pages/Budgets"));
const SavingsGoals = lazy(() => import("@/components/pages/SavingsGoals"));
const Reports = lazy(() => import("@/components/pages/Reports"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Wrap each lazy component in Suspense
const SuspenseWrapper = (Component) => {
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <Component />
    </Suspense>
  );
};

const mainRoutes = [
  {
    path: "",
    element: SuspenseWrapper(Dashboard),
    index: true
  },
  {
    path: "transactions",
    element: SuspenseWrapper(Transactions)
  },
  {
    path: "budgets",
    element: SuspenseWrapper(Budgets)
  },
  {
    path: "goals",
    element: SuspenseWrapper(SavingsGoals)
  },
  {
    path: "reports",
    element: SuspenseWrapper(Reports)
  },
  {
    path: "*",
    element: SuspenseWrapper(NotFound)
  }
];

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);