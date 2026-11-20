import type { Variant } from "@/components/features/rules/preview-primitives";

const card = "w-full min-w-0 rounded-md border border-neutral-200 bg-white p-3 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";
export const exampleCode = "012345";

export function CodeResult({ variant }: { variant: Variant }) {
    const value = variant === "do" ? exampleCode : exampleCode[0];
    return (
        <div className={card}>
            <div className="text-xs font-semibold">Verification code</div>
            {variant === "do" ? (
                <div className="mt-2 flex h-8 w-28 items-center rounded border border-neutral-400 px-2 font-mono text-base tracking-widest dark:border-neutral-500">{value}</div>
            ) : (
                <div className="mt-2 flex gap-1.5">
                    {Array.from({ length: 6 }, (_, index) => (
                        <span key={index} className="flex h-8 min-w-0 flex-1 items-center justify-center rounded border border-neutral-300 font-mono text-base dark:border-neutral-600">{value[index]}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

export function RestaurantReview({ variant, rtl = false }: { variant: Variant; rtl?: boolean }) {
    const name = rtl ? "Cafe Luna" : "קפה לונה";
    const nameLang = rtl ? "en" : "he";
    return (
        <div className={card} lang={rtl ? "he" : "en"} dir={rtl ? "rtl" : "ltr"}>
            <div className="text-xs font-semibold">{rtl ? "ביקורות על מסעדות" : "Restaurant reviews"}</div>
            <p className="mt-3 text-sm">
                {variant === "do" ? <bdi lang={nameLang}>{name}</bdi> : <span lang={nameLang}>{name}</span>}
                {rtl ? " – 5 ביקורות" : " – 5 reviews"}
            </p>
        </div>
    );
}

const quarters = {
    Q1: [
        { month: "Jan", billing: 45, delivery: 30 },
        { month: "Feb", billing: 36, delivery: 36 },
        { month: "Mar", billing: 27, delivery: 42 },
    ],
    Q2: [
        { month: "Apr", billing: 24, delivery: 48 },
        { month: "May", billing: 33, delivery: 40 },
        { month: "Jun", billing: 42, delivery: 32 },
    ],
} as const;

export type ReportingQuarter = keyof typeof quarters;

export function TicketChart({ variant, quarter = "Q1", interactive = false }: {
    variant: Variant;
    quarter?: ReportingQuarter;
    interactive?: boolean;
}) {
    const rows = quarters[quarter];
    const first = rows[0];
    const last = rows[2];
    const result = (start: number, end: number) => `${end > start ? "rose" : "fell"} from ${start} to ${end}`;
    const period = `${first.month}–${last.month}`;
    const table = (
        <table className="w-full text-start text-sm leading-6 tabular-nums">
            <caption className="sr-only">Monthly support tickets, {period}</caption>
            <thead><tr><th scope="col" className="text-start">Month</th><th scope="col" className="text-end">Billing</th><th scope="col" className="text-end">Delivery</th></tr></thead>
            <tbody>{rows.map((row) => (
                <tr key={row.month}><th scope="row" className="text-start font-normal">{row.month}</th><td className="text-end">{row.billing}</td><td className="text-end">{row.delivery}</td></tr>
            ))}</tbody>
        </table>
    );
    return (
        <div className={card}>
            <div className={interactive ? "text-sm font-semibold" : "text-xs font-semibold"}>Support tickets · {period}</div>
            <div className={`mt-2 flex items-center gap-3 ${interactive ? "text-xs" : "text-[10px]"}`}>
                <span className="flex items-center gap-1"><i className="size-2 bg-blue-700 dark:bg-blue-400" />Billing</span>
                <span className="flex items-center gap-1"><i className="size-2 border border-current" />Delivery</span>
            </div>
            <div role="img" aria-label={`Bar chart of monthly support tickets, ${period}`} className="mt-2 grid grid-cols-[auto_1fr] gap-x-1.5">
                <div className={`relative text-end leading-none tabular-nums ${interactive ? "w-5 text-xs" : "w-3 text-[9px]"}`}>
                    <span className="absolute end-0 top-0 -translate-y-1/2">50</span>
                    <span className="absolute end-0 top-1/2 -translate-y-1/2">25</span>
                    <span className="absolute bottom-0 end-0 translate-y-1/2">0</span>
                </div>
                <div className={`flex items-end justify-around border-b border-s border-neutral-400 ${interactive ? "h-24" : "h-14"}`}>
                    {rows.map((row) => (
                        <div key={row.month} className="flex h-full items-end gap-1">
                            <span className="w-3 bg-blue-700 dark:bg-blue-400" style={{ height: `${row.billing / 50 * 100}%` }} />
                            <span className="w-3 border border-current" style={{ height: `${row.delivery / 50 * 100}%` }} />
                        </div>
                    ))}
                </div>
                <div className={`col-start-2 flex justify-around ${interactive ? "text-xs" : "text-[10px]"}`}>{rows.map((r) => <span key={r.month}>{r.month}</span>)}</div>
            </div>
            {variant === "do" && (
                <>
                    <p className={`mt-2 ${interactive ? "text-sm" : "text-xs"}`}>Billing {result(first.billing, last.billing)} tickets. Delivery {result(first.delivery, last.delivery)}.</p>
                    {interactive && <details><summary className="cursor-pointer py-2.5 text-sm leading-6 underline underline-offset-2">Monthly counts</summary>{table}</details>}
                </>
            )}
        </div>
    );
}
