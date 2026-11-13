import { axiomMark } from "@/lib/brand";

export function AxiomLogo({
    className,
    width,
    color = "currentColor",
}: {
    className?: string;
    width?: number;
    color?: string;
}) {
    return (
        <svg
            viewBox={axiomMark.viewBox}
            fill={color}
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            width={width}
            height={width}
            aria-hidden="true"
        >
            {axiomMark.paths.map((d) => <path key={d} d={d} />)}
        </svg>
    );
}
