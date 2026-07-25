import { ImageResponse } from "next/og";
import { categories, rules } from "@/data/ui-logic";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Axiom UI design rule — Do and Don't comparison";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: Props) {
  const { id } = await params;
  const rule = rules.find((candidate) => candidate.id === id);
  const category = categories.find((candidate) => candidate.id === rule?.category);

  if (!rule) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#fafafa",
            fontSize: 64,
          }}
        >
          Axiom
        </div>
      ),
      size,
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 14,
                backgroundColor: "#fafafa",
                color: "#0a0a0a",
                fontSize: 34,
                fontWeight: 700,
              }}
            >
              A
            </div>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>
              Axiom
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#a1a1aa" }}>
            {category?.name ?? ""}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {rule.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.4,
              color: "#a1a1aa",
              maxWidth: 980,
            }}
          >
            {rule.desc.length > 140 ? `${rule.desc.slice(0, 137)}...` : rule.desc}
          </div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flex: 1,
              padding: "24px 28px",
              borderRadius: 20,
              backgroundColor: "#052e1b",
              border: "1px solid #14532d",
            }}
          >
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#34d399" }}>
              Do
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "#e4e4e7" }}>
              {rule.do.length > 60 ? `${rule.do.slice(0, 57)}...` : rule.do}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flex: 1,
              padding: "24px 28px",
              borderRadius: 20,
              backgroundColor: "#3b0a12",
              border: "1px solid #7f1d1d",
            }}
          >
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#fb7185" }}>
              Don&apos;t
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "#e4e4e7" }}>
              {rule.dont.length > 60 ? `${rule.dont.slice(0, 57)}...` : rule.dont}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
