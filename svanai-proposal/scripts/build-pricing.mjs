#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";


function parseArgs(argv) {
  const args = { input: null, output: null, previewDir: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") args.input = argv[++index];
    else if (value === "--output") args.output = argv[++index];
    else if (value === "--preview-dir") args.previewDir = argv[++index];
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!args.input || !args.output) {
    throw new Error("Usage: build-pricing.mjs --input pricing-input.json --output pricing.xlsx [--preview-dir previews]");
  }
  return args;
}


function validateInput(input) {
  if (!Array.isArray(input.phases) || input.phases.length === 0) {
    throw new Error("pricing input requires at least one phase row");
  }
  for (const [index, row] of input.phases.entries()) {
    for (const key of ["phase", "role", "description", "hours"]) {
      if (row[key] === undefined || row[key] === null || row[key] === "") {
        throw new Error(`phases[${index}].${key} is required`);
      }
    }
    if (Number(row.hours) < 0) throw new Error(`phases[${index}].hours must be non-negative`);
  }
}


function styleTitle(sheet, range, title) {
  sheet.getRange(range).merge();
  sheet.getRange(range.split(":")[0]).values = [[title]];
  sheet.getRange(range).format = {
    fill: "#121212",
    font: { bold: true, color: "#FFFFFF", size: 18 },
    verticalAlignment: "center",
  };
  sheet.getRange(range).format.rowHeight = 34;
}


function styleHeader(range) {
  range.format = {
    fill: "#121212",
    font: { bold: true, color: "#FFFFFF" },
    borders: { preset: "inside", style: "thin", color: "#333333" },
    verticalAlignment: "center",
  };
  range.format.rowHeight = 24;
}


function styleSection(range) {
  range.format = {
    fill: "#E5FCF0",
    font: { bold: true, color: "#121212" },
    borders: { bottom: { style: "thin", color: "#00E673" } },
  };
}


function currencyFormat() {
  return '"INR" #,##0;[Red]("INR" #,##0);-';
}


function uniqueClientPhases(input) {
  const explicit = Array.isArray(input.client_phases) ? input.client_phases : [];
  if (explicit.length) return explicit;
  const map = new Map();
  for (const row of input.phases) {
    if (!map.has(row.phase)) {
      map.set(row.phase, { phase: row.phase, description: row.description, allocation_weight: 1 });
    }
  }
  return [...map.values()];
}


const args = parseArgs(process.argv.slice(2));
const input = JSON.parse(await fs.readFile(args.input, "utf8"));
validateInput(input);

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Summary");
const assumptions = workbook.worksheets.add("Assumptions");
const roleRates = workbook.worksheets.add("Role Rates");
const estimate = workbook.worksheets.add("Estimate");
const clientView = workbook.worksheets.add("Client View");
const checks = workbook.worksheets.add("Checks");

for (const sheet of [summary, assumptions, roleRates, estimate, clientView, checks]) {
  sheet.showGridLines = false;
}

const meta = input.metadata || {};
const model = input.assumptions || {};
const roleRateEntries = Object.entries(input.role_rates || {});
const clientPhases = uniqueClientPhases(input);

// Assumptions
styleTitle(assumptions, "A1:C1", "svanAI Proposal Pricing - Assumptions");
assumptions.getRange("A3:C3").values = [["Input", "Value", "Notes"]];
styleHeader(assumptions.getRange("A3:C3"));
assumptions.getRange("A4:C15").values = [
  ["Currency", model.currency || "INR", "Client proposal currency"],
  ["Fallback company cost / hour", Number(model.company_rate || 0), "Used when no role rate exists"],
  ["Target gross margin", Number(model.target_margin || 0), "Margin on client price, not markup"],
  ["Contingency", Number(model.contingency || 0), "Applied to cost subtotal"],
  ["Discount", Number(model.discount || 0), "Applied to both comparison prices"],
  ["Fixed value-based price", Number(model.value_price || 0), "Pre-discount value price"],
  ["Tax rate", Number(model.tax_rate || 0), "Applied after selected client price"],
  ["PM hours", Number(model.pm_hours || 0), "Hours-based PM estimate"],
  ["PM percentage", Number(model.pm_percentage || 0), "Percentage of delivery cost"],
  ["Selected PM method", model.pm_method || "hours", "hours or percentage"],
  ["Selected pricing model", model.selected_model || "cost-derived", "cost-derived, value-based, or manual"],
  ["Manual selected price", Number(model.manual_price || 0), "Used only when selected model is manual"],
];
assumptions.getRange("B4:B15").format.font = { color: "#2563EB" };
assumptions.getRange("B5:B5").format.numberFormat = currencyFormat();
assumptions.getRange("B6:B8").format.numberFormat = "0.0%";
assumptions.getRange("B9:B9").format.numberFormat = currencyFormat();
assumptions.getRange("B10:B10").format.numberFormat = "0.0%";
assumptions.getRange("B12:B12").format.numberFormat = "0.0%";
assumptions.getRange("B13").dataValidation = { rule: { type: "list", values: ["hours", "percentage"] } };
assumptions.getRange("B14").dataValidation = { rule: { type: "list", values: ["cost-derived", "value-based", "manual"] } };
assumptions.getRange("A4:C15").format.borders = { insideHorizontal: { style: "thin", color: "#E4E6EA" } };
assumptions.getRange("A4:C15").format.wrapText = true;
assumptions.getRange("A1:A15").format.columnWidth = 28;
assumptions.getRange("B1:B15").format.columnWidth = 20;
assumptions.getRange("C1:C15").format.columnWidth = 43;
assumptions.freezePanes.freezeRows(3);

// Role rates
styleTitle(roleRates, "A1:C1", "Private Role Cost Rates");
roleRates.getRange("A3:C3").values = [["Role", "Internal Hourly Cost", "Source"]];
styleHeader(roleRates.getRange("A3:C3"));
const roleRows = roleRateEntries.length
  ? roleRateEntries.map(([role, rate]) => [role, Number(rate), "User-confirmed internal rate"])
  : [["", null, "Fallback company cost will apply"]];
roleRates.getRangeByIndexes(3, 0, roleRows.length, 3).values = roleRows;
roleRates.getRange(`B4:B${3 + roleRows.length}`).format.numberFormat = currencyFormat();
roleRates.getRange(`A4:C${3 + roleRows.length}`).format.borders = { insideHorizontal: { style: "thin", color: "#E4E6EA" } };
roleRates.getRange("A1:A30").format.columnWidth = 28;
roleRates.getRange("B1:B30").format.columnWidth = 22;
roleRates.getRange("C1:C30").format.columnWidth = 36;
roleRates.freezePanes.freezeRows(3);

// Estimate
styleTitle(estimate, "A1:F1", "Private Delivery Estimate");
estimate.getRange("B3:C3").merge();
estimate.getRange("E3:F3").merge();
estimate.getRange("B4:F4").merge();
estimate.getRange("A3").values = [["Project"]];
estimate.getRange("B3").values = [[meta.project || "TBC"]];
estimate.getRange("D3").values = [["Client"]];
estimate.getRange("E3").values = [[meta.client || "TBC"]];
estimate.getRange("A4").values = [["Branch"]];
estimate.getRange("B4").values = [[meta.branch || "TBC"]];
estimate.getRange("A3:F4").format = { fill: "#E5FCF0", font: { bold: true }, wrapText: true };
estimate.getRange("A3:F4").format.rowHeight = 27;
estimate.getRange("A6:F6").values = [["Phase", "Role", "Description", "Hours", "Internal Rate", "Internal Cost"]];
styleHeader(estimate.getRange("A6:F6"));
const firstEstimateRow = 7;
const lastEstimateRow = firstEstimateRow + input.phases.length - 1;
estimate.getRangeByIndexes(firstEstimateRow - 1, 0, input.phases.length, 4).values = input.phases.map((row) => [
  row.phase,
  row.role,
  row.description,
  Number(row.hours),
]);
const roleLastRow = 3 + roleRows.length;
for (let row = firstEstimateRow; row <= lastEstimateRow; row += 1) {
  estimate.getRange(`E${row}`).formulas = [[`=IFERROR(VLOOKUP(B${row},'Role Rates'!$A$4:$B$${roleLastRow},2,FALSE),'Assumptions'!$B$5)`]];
  estimate.getRange(`F${row}`).formulas = [[`=D${row}*E${row}`]];
}
estimate.getRange(`A6:F${lastEstimateRow}`).format.borders = { insideHorizontal: { style: "thin", color: "#E4E6EA" } };
estimate.getRange(`D6:D${lastEstimateRow}`).format.numberFormat = "0.0";
estimate.getRange(`E6:F${lastEstimateRow}`).format.numberFormat = currencyFormat();
estimate.getRange("A1:A200").format.columnWidth = 24;
estimate.getRange("B1:B200").format.columnWidth = 22;
estimate.getRange("C1:C200").format.columnWidth = 48;
estimate.getRange("D1:F200").format.columnWidth = 18;
estimate.getRange(`A6:C${lastEstimateRow}`).format.wrapText = true;
estimate.freezePanes.freezeRows(6);

// Summary
styleTitle(summary, "A1:F1", "svanAI Proposal Pricing Summary");
summary.getRange("A3:B3").values = [["Proposal", "Value"]];
styleHeader(summary.getRange("A3:B3"));
summary.getRange("A4:B7").values = [
  ["Project", meta.project || "TBC"],
  ["Client", meta.client || "TBC"],
  ["Branch", meta.branch || "TBC"],
  ["Currency", model.currency || "INR"],
];
summary.getRange("D3:E3").values = [["Pricing output", "Amount"]];
styleHeader(summary.getRange("D3:E3"));
summary.getRange("D4:D8").values = [
  ["Cost-derived price"],
  ["Value-based price"],
  ["Selected client price"],
  ["Tax"],
  ["Grand total"],
];
summary.getRange("A11:B11").values = [["Private cost build", "Amount"]];
styleSection(summary.getRange("A11:B11"));
summary.getRange("A12:A23").values = [
  ["Delivery cost"],
  ["PM hours cost"],
  ["PM percentage cost"],
  ["Selected PM cost"],
  ["Cost subtotal"],
  ["Contingency"],
  ["Cost base"],
  ["Cost-derived price before discount"],
  ["Discount amount"],
  ["Cost-derived price"],
  ["Value-based price"],
  ["Selected client price"],
];
summary.getRange("B12").formulas = [[`=SUM('Estimate'!$F$${firstEstimateRow}:$F$${lastEstimateRow})`]];
summary.getRange("B13").formulas = [[`='Assumptions'!$B$11*IFERROR(VLOOKUP("Project Management",'Role Rates'!$A$4:$B$${roleLastRow},2,FALSE),'Assumptions'!$B$5)`]];
summary.getRange("B14").formulas = [[`=B12*'Assumptions'!$B$12`]];
summary.getRange("B15").formulas = [[`=IF('Assumptions'!$B$13="percentage",B14,B13)`]];
summary.getRange("B16").formulas = [["=B12+B15"]];
summary.getRange("B17").formulas = [[`=B16*'Assumptions'!$B$7`]];
summary.getRange("B18").formulas = [["=B16+B17"]];
summary.getRange("B19").formulas = [[`=IF(AND('Assumptions'!$B$6>=0,'Assumptions'!$B$6<1),B18/(1-'Assumptions'!$B$6),0)`]];
summary.getRange("B20").formulas = [[`=B19*'Assumptions'!$B$8`]];
summary.getRange("B21").formulas = [["=B19-B20"]];
summary.getRange("B22").formulas = [[`='Assumptions'!$B$9*(1-'Assumptions'!$B$8)`]];
summary.getRange("B23").formulas = [[`=IF('Assumptions'!$B$14="cost-derived",B21,IF('Assumptions'!$B$14="value-based",B22,'Assumptions'!$B$15))`]];
summary.getRange("E4").formulas = [["=B21"]];
summary.getRange("E5").formulas = [["=B22"]];
summary.getRange("E6").formulas = [["=B23"]];
summary.getRange("E7").formulas = [[`=E6*'Assumptions'!$B$10`]];
summary.getRange("E8").formulas = [["=E6+E7"]];
summary.getRange("B12:B23").format.numberFormat = currencyFormat();
summary.getRange("E4:E8").format.numberFormat = currencyFormat();
summary.getRange("D6:E6").format = { fill: "#E5FCF0", font: { bold: true, color: "#121212" }, borders: { preset: "outside", style: "medium", color: "#00E673" } };
summary.getRange("D8:E8").format = { fill: "#121212", font: { bold: true, color: "#00E673" } };
summary.getRange("A4:B7").format.borders = { insideHorizontal: { style: "thin", color: "#E4E6EA" } };
summary.getRange("A12:B23").format.borders = { insideHorizontal: { style: "thin", color: "#E4E6EA" } };
summary.getRange("A1:A30").format.columnWidth = 34;
summary.getRange("B1:B30").format.columnWidth = 24;
summary.getRange("C1:C30").format.columnWidth = 4;
summary.getRange("D1:D30").format.columnWidth = 30;
summary.getRange("E1:E30").format.columnWidth = 24;
summary.getRange("F1:F30").format.columnWidth = 4;

// Client View
styleTitle(clientView, "A1:F1", "Approved Client Pricing View");
clientView.getRange("A3:F3").merge();
clientView.getRange("A3").values = [["Copy only this sheet's approved figures into the client proposal. Internal costs and margins remain private."]];
clientView.getRange("A3:F3").format = { fill: "#E5FCF0", font: { color: "#121212" }, wrapText: true };
clientView.getRange("A5:F5").values = [["Phase", "Description", "Hours", "Blended Client Rate", "Amount", "Allocation Weight"]];
styleHeader(clientView.getRange("A5:F5"));
const firstClientRow = 6;
const lastClientRow = firstClientRow + clientPhases.length - 1;
clientView.getRangeByIndexes(firstClientRow - 1, 0, clientPhases.length, 2).values = clientPhases.map((row) => [row.phase, row.description || ""]);
clientView.getRangeByIndexes(firstClientRow - 1, 5, clientPhases.length, 1).values = clientPhases.map((row) => [Number(row.allocation_weight || 1)]);
for (let row = firstClientRow; row <= lastClientRow; row += 1) {
  clientView.getRange(`C${row}`).formulas = [[`=SUMIF('Estimate'!$A$${firstEstimateRow}:$A$${lastEstimateRow},A${row},'Estimate'!$D$${firstEstimateRow}:$D$${lastEstimateRow})`]];
  clientView.getRange(`D${row}`).formulas = [[`=IF(SUM($C$${firstClientRow}:$C$${lastClientRow})>0,'Summary'!$E$6/SUM($C$${firstClientRow}:$C$${lastClientRow}),0)`]];
  const amountFormula = row === lastClientRow
    ? (row === firstClientRow
      ? `='Summary'!$E$6`
      : `='Summary'!$E$6-SUM($E$${firstClientRow}:E${row - 1})`)
    : `=IF(SUM($C$${firstClientRow}:$C$${lastClientRow})>0,C${row}*D${row},'Summary'!$E$6*F${row}/SUM($F$${firstClientRow}:$F$${lastClientRow}))`;
  clientView.getRange(`E${row}`).formulas = [[amountFormula]];
}
const clientSubtotalRow = lastClientRow + 2;
clientView.getRange(`D${clientSubtotalRow}:D${clientSubtotalRow + 2}`).values = [["Subtotal"], ["Tax"], ["Grand total"]];
clientView.getRange(`E${clientSubtotalRow}`).formulas = [[`=SUM(E${firstClientRow}:E${lastClientRow})`]];
clientView.getRange(`E${clientSubtotalRow + 1}`).formulas = [["='Summary'!$E$7"]];
clientView.getRange(`E${clientSubtotalRow + 2}`).formulas = [["='Summary'!$E$8"]];
clientView.getRange(`D${clientSubtotalRow + 2}:E${clientSubtotalRow + 2}`).format = { fill: "#121212", font: { bold: true, color: "#00E673" } };
clientView.getRange(`C${firstClientRow}:C${lastClientRow}`).format.numberFormat = "0.0";
clientView.getRange(`D${firstClientRow}:E${clientSubtotalRow + 2}`).format.numberFormat = currencyFormat();
clientView.getRange(`A${firstClientRow}:F${lastClientRow}`).format.borders = { insideHorizontal: { style: "thin", color: "#E4E6EA" } };
clientView.getRange("A1:A200").format.columnWidth = 24;
clientView.getRange("B1:B200").format.columnWidth = 48;
clientView.getRange("C1:F200").format.columnWidth = 19;
clientView.getRange(`A${firstClientRow}:B${lastClientRow}`).format.wrapText = true;
clientView.freezePanes.freezeRows(5);

// Checks
styleTitle(checks, "A1:C1", "Pricing Model Checks");
checks.getRange("A2").values = [["MODEL STATUS"]];
checks.getRange("B2").formulas = [["=IF(COUNTIF(B5:B11,\"FAIL\")=0,\"PASS\",\"FAIL\")"]];
checks.getRange("A2:B2").format = { fill: "#E5FCF0", font: { bold: true, color: "#121212" }, borders: { preset: "outside", style: "medium", color: "#00E673" } };
checks.getRange("A4:C4").values = [["Check", "Result", "Where to fix"]];
styleHeader(checks.getRange("A4:C4"));
checks.getRange("A5:A11").values = [
  ["All internal rates resolve above zero"],
  ["Target margin is between 0% and 100%"],
  ["Contingency is between 0% and 100%"],
  ["Discount is between 0% and 100%"],
  ["Selected client price is non-negative"],
  ["Client phase amounts reconcile"],
  ["Grand total reconciles to price plus tax"],
];
checks.getRange("B5").formulas = [[`=IF(COUNTIF('Estimate'!$E$${firstEstimateRow}:$E$${lastEstimateRow},"<=0")=0,"PASS","FAIL")`]];
checks.getRange("B6").formulas = [[`=IF(AND('Assumptions'!$B$6>=0,'Assumptions'!$B$6<1),"PASS","FAIL")`]];
checks.getRange("B7").formulas = [[`=IF(AND('Assumptions'!$B$7>=0,'Assumptions'!$B$7<=1),"PASS","FAIL")`]];
checks.getRange("B8").formulas = [[`=IF(AND('Assumptions'!$B$8>=0,'Assumptions'!$B$8<=1),"PASS","FAIL")`]];
checks.getRange("B9").formulas = [[`=IF('Summary'!$E$6>=0,"PASS","FAIL")`]];
checks.getRange("B10").formulas = [[`=IF(ABS(SUM('Client View'!$E$${firstClientRow}:$E$${lastClientRow})-'Summary'!$E$6)<0.5,"PASS","FAIL")`]];
checks.getRange("B11").formulas = [[`=IF(ABS('Summary'!$E$8-('Summary'!$E$6+'Summary'!$E$7))<0.5,"PASS","FAIL")`]];
checks.getRange("C5:C11").values = [
  ["Role Rates / Assumptions"],
  ["Assumptions"],
  ["Assumptions"],
  ["Assumptions"],
  ["Assumptions / Summary"],
  ["Client View"],
  ["Summary"],
];
checks.getRange("A5:C11").format.borders = { insideHorizontal: { style: "thin", color: "#E4E6EA" } };
checks.getRange("B5:B11").conditionalFormats.add("containsText", { text: "FAIL", format: { fill: "#FEE2E2", font: { bold: true, color: "#B91C1C" } } });
checks.getRange("B5:B11").conditionalFormats.add("containsText", { text: "PASS", format: { fill: "#E5FCF0", font: { bold: true, color: "#007C40" } } });
checks.getRange("A1:A30").format.columnWidth = 44;
checks.getRange("B1:B30").format.columnWidth = 18;
checks.getRange("C1:C30").format.columnWidth = 28;

const summaryInspect = await workbook.inspect({
  kind: "region",
  sheetId: "Summary",
  range: "A1:E23",
  maxChars: 3500,
});
console.log(summaryInspect.ndjson);
const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "pricing workbook formula error scan",
});
console.log(errorScan.ndjson);

if (args.previewDir) {
  await fs.mkdir(args.previewDir, { recursive: true });
  for (const sheetName of ["Summary", "Assumptions", "Role Rates", "Estimate", "Client View", "Checks"]) {
    const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
    const fileName = `${sheetName.toLowerCase().replaceAll(" ", "-")}.png`;
    await fs.writeFile(path.join(args.previewDir, fileName), new Uint8Array(await preview.arrayBuffer()));
  }
}

await fs.mkdir(path.dirname(args.output), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(args.output);
console.log(`Built ${args.output}`);
