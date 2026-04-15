import ExcelJS from "exceljs";

interface Device {
  name: string;
  type: string;
  ip?: string;
  mac?: string;
  vlan?: number;
  switchPort?: number;
  state: string;
  notes?: string;
}

export async function exportExcel(devices: Device[], projectName: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Visor de Planos de Red";
  wb.created = new Date();

  const ws = wb.addWorksheet("Inventario");

  ws.columns = [
    { header: "Nombre", key: "name", width: 22 },
    { header: "Tipo", key: "type", width: 14 },
    { header: "IP", key: "ip", width: 16 },
    { header: "MAC", key: "mac", width: 20 },
    { header: "VLAN", key: "vlan", width: 8 },
    { header: "Puerto Switch", key: "switchPort", width: 14 },
    { header: "Estado", key: "state", width: 12 },
    { header: "Observaciones", key: "notes", width: 35 },
  ];

  // Estilo de Cabecera
  ws.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A5FA8" },
    };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF0F6E56" } },
    };
  });

  // Filas con color alternado
  devices.forEach((d, i) => {
    const row = ws.addRow(d);
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF4F4F2" },
        };
      });
    }
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName}-inventario.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
