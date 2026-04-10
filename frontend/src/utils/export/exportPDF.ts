import jsPDF from "jspdf";

export async function exportPDF(
  canvasElement: HTMLCanvasElement,
  projectName: string,
) {
  const imgData = canvasElement.toDataURL("image/png", 1.0);
  const pdf = new jsPDF({ orientation: "l", unit: "mm", format: "a4" });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Cabecera
  pdf.setFontSize(14);
  pdf.setTextColor(26, 95, 168);
  pdf.text(`Visor de Planos - ${projectName}`, 10, 12);

  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    `Exportado ${new Date().toLocaleDateString("es-ES")}`,
    pageW - 60,
    12,
  );

  pdf.setDrawColor(26, 95, 168);
  pdf.line(10, 15, pageW - 10, 15);

  // Imagen del canvas 3D
  pdf.addImage(imgData, "PNG", 10, 12, pageW - 20, pageH - 30);

  pdf.save(`${projectName}-plano.pdf`);
}
