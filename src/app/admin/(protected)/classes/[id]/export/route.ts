import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getClassRoster } from "@/lib/admin";
import { formatGradeRange } from "@/lib/format";

export const runtime = "nodejs";

// Route handlers are NOT wrapped by the (protected) layout, so this endpoint
// enforces the admin check itself.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const roster = await getClassRoster(id);
  if (!roster) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const header = [
    "Student first name",
    "Student last name",
    "Grade",
    "Parent email",
    "Parent phone",
    "Amount (USD)",
    "Status",
    "Registered at",
    "Paid at",
  ];

  const lines = roster.rows.map((r) =>
    [
      r.student_first_name,
      r.student_last_name,
      formatGradeRange(r.student_grade, r.student_grade),
      r.parent_email,
      r.parent_phone ?? "",
      (r.amount_cents / 100).toFixed(2),
      r.status,
      r.created_at,
      r.paid_at ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [header.map(csvEscape).join(","), ...lines].join("\r\n");
  const filename = `${roster.slug || "roster"}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

// Quote fields containing commas, quotes, or newlines; double up inner quotes.
function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
