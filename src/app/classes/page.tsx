import type { Metadata } from "next";
import { CatalogView } from "./CatalogView";

export const metadata: Metadata = {
  title: "Classes — 101 Discoveries",
  description:
    "Browse chess and math enrichment classes for K–8 students in Jersey City.",
};

export default function ClassesPage() {
  return <CatalogView />;
}
