import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { fromPath } from 'pdf2pic';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';

export interface PdfPageInfo {
  pageNumber: number;
  imagePath: string;
  width: number;
  height: number;
}

@Injectable()
export class PdfService {
  async extractPages(
    pdfPath: string,
    projectId: string,
  ): Promise<PdfPageInfo[]> {
    try {
      // Leer el PDF para saber cuántas páginas tiene y sus dimensiones
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();

      // Carpeta de salida para las imágenes PNG
      const outputDir = path.join('uploads', 'floors', projectId);
      fs.mkdirSync(outputDir, { recursive: true });

      // Configurar el conversor pdf2pic
      const converter = fromPath(pdfPath, {
        density: 150,
        saveFilename: 'page',
        savePath: outputDir,
        format: 'png',
        width: 2480,
        height: 3508,
      });

      const pages: PdfPageInfo[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const result = await converter(i, { responseType: 'image' });
        const page = pdfDoc.getPage(i - 1);
        const { width, height } = page.getSize();

        pages.push({
          pageNumber: i,
          imagePath: result.path ?? '',
          width,
          height,
        });
      }

      return pages;
    } catch {
      throw new InternalServerErrorException(
        'Error al procesar el PDF. Verifica que Ghostscript está instalado.',
      );
    }
  }
}
