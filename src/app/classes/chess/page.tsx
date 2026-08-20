import type { Metadata } from "next";
import { CatalogView } from "../CatalogView";

export const metadata: Metadata = {
  title: "Chess Classes — 101Discoveries",
  description:
    "Browse chess enrichment classes for K–8 students in Jersey City.",
};

export default function ChessClassesPage() {
  return <CatalogView category="chess" />;
}
