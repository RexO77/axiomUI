// design-system: strict

import type { RuleAnnotations } from "@/components/rule/measure/specs";
import { accessibilityMarks } from "./accessibility";
import { ANNOTATIONS } from "./base";
import { colorMarks } from "./color";
import { componentsMarks } from "./components";
import { formsMarks } from "./forms";
import { layoutMarks } from "./layout";
import { motionMarks } from "./motion";
import { systemMarks } from "./system";
import { typographyMarks } from "./typography";

export const MEASURE_MARKS: Record<string, RuleAnnotations> = {
  ...ANNOTATIONS,
  ...typographyMarks,
  ...layoutMarks,
  ...colorMarks,
  ...componentsMarks,
  ...formsMarks,
  ...systemMarks,
  ...motionMarks,
  ...accessibilityMarks,
};

export const RULE_ANNOTATIONS = MEASURE_MARKS;
