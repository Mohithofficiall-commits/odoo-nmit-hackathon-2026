export interface SalaryBreakdown {
  baseSalary: number;
  hra: number; // 40% of base
  da: number; // 10% of base
  transportAllowance: number;
  medicalAllowance: number;
  grossSalary: number;
  providentFund: number; // 12% of base
  esi: number; // 0.75% of gross if gross < 21000
  taxDeduction: number; // income tax bracket estimation
  netSalary: number;
}

export function computeSalaryBreakdown(baseSalary: number): SalaryBreakdown {
  const hra = Math.round(baseSalary * 0.40);
  const da = Math.round(baseSalary * 0.10);
  const transportAllowance = 1600;
  const medicalAllowance = 1250;

  const grossSalary = baseSalary + hra + da + transportAllowance + medicalAllowance;

  const providentFund = Math.round(baseSalary * 0.12);
  const esi = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;

  // Simple income tax tier estimation for annual income
  const annualGross = grossSalary * 12;
  let annualTax = 0;
  if (annualGross > 700000) {
    annualTax = (annualGross - 700000) * 0.10;
  }
  const taxDeduction = Math.round(annualTax / 12);

  const totalDeductions = providentFund + esi + taxDeduction;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    baseSalary,
    hra,
    da,
    transportAllowance,
    medicalAllowance,
    grossSalary,
    providentFund,
    esi,
    taxDeduction,
    netSalary,
  };
}
