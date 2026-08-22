import type { Metadata } from "next";
import { CatalogView } from "../CatalogView";

export const metadata: Metadata = {
  title: "Math Classes — 101 Discoveries",
  description:
    "Browse math enrichment classes for K–8 students in Jersey City.",
};

export default function MathClassesPage() {
  return <CatalogView category="math" />;
}
