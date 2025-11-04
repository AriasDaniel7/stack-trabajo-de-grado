import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import path from 'path';
import * as ExcelJS from 'exceljs';
import type { Response } from 'express';
import { FeeEntity } from '@database/entities/rates';
import { PaymentType, VinculationType } from '@database/interfaces/data';
import { ProgramOfferingMapResponse } from '@program/maps/program.map';

export class EconomicViabilityProtocolTemplate {
  private logger = new Logger(EconomicViabilityProtocolTemplate.name);
  async generate(
    res: Response,
    fees: FeeEntity[],
    offering: ProgramOfferingMapResponse,
  ) {
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'documents',
      'protocolo-2025.xlsx',
    );

    if (!existsSync(templatePath)) {
      throw new NotFoundException(
        `Template file not found at path: ${templatePath}`,
      );
    }
    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.readFile(templatePath);

      const worksheet = workbook.getWorksheet(1);

      if (worksheet) {
        worksheet.getCell('C7').value = offering.smmlv.value;
        worksheet.getCell('C9').value = offering.pensum.credits;

        const feeFactorSmmlvMap = new Map<string, string>();
        const feeCreditValueSmmlvMap = new Map<string, string>();

        fees.forEach((fee, index) => {
          const rowNumber = 7 + index;
          const modalityName = fee.modality.name.toUpperCase();

          worksheet.getCell(`E${rowNumber}`).value =
            `${modalityName} = ${fee.factor_smmlv} SMMLV`;
          worksheet.getCell(`F${rowNumber}`).value = {
            formula: `C7*${fee.factor_smmlv}`,
          };

          worksheet.getCell(`T${rowNumber + 1}`).value = modalityName;
          worksheet.getCell(`V${rowNumber + 1}`).value =
            `${fee.credit_value_smmlv} SMMLV`;
          worksheet.getCell(`W${rowNumber + 1}`).value = {
            formula: `C7*${fee.credit_value_smmlv}`,
          };

          feeFactorSmmlvMap.set(modalityName, `F${rowNumber}`);
          feeCreditValueSmmlvMap.set(modalityName, `W${rowNumber + 1}`);
        });

        const programModality = offering.program.modality.toUpperCase();
        const targetCell = feeFactorSmmlvMap.get(programModality);

        if (targetCell) {
          worksheet.getCell('C8').value = {
            formula: `C9*${targetCell}`,
          };
        } else {
          worksheet.getCell('C8').value = 0;
        }

        worksheet.getCell('C13').value = offering.program.faculty
          ? offering.program.faculty.toUpperCase()
          : '';
        worksheet.getCell('C14').value = offering.program.name.toUpperCase();
        worksheet.getCell('C15').value = offering.cohort;
        worksheet.getCell('E15').value = offering.semester;
        worksheet.getCell('F15').value = offering.codeCDP
          ? offering.codeCDP
          : '';
        worksheet.getCell('C16').value = offering.program.unity.toUpperCase();
        worksheet.getCell('C17').value = offering.director.name.toUpperCase();

        if (offering.discounts && offering.discounts.length > 0) {
          const templateRowDiscounts = 9;
          offering.discounts.forEach((discount, index) => {
            const rowNumber = templateRowDiscounts + index;
            worksheet.getCell(`I${rowNumber}`).value =
              discount.percentage / 100;

            worksheet.getCell(`J${rowNumber}`).value =
              discount.numberOfApplicants;
          });
        }

        if (offering.seminars && offering.seminars.length > 0) {
          const seminars = offering.seminars;

          const seminarBonifications = seminars.filter(
            (seminar) =>
              seminar.payment_type === PaymentType.BONIFICACIONES_PLANTA_ADMIN,
          );

          const seminarDocentExternal = seminars.filter(
            (seminar) =>
              seminar.payment_type === PaymentType.DOCENTE_EXTERNO_OPS,
          );

          const templateRowBonifications = 22;
          let lastBonificationRow = templateRowBonifications;

          if (seminarBonifications.length > 0) {
            for (let i = 1; i < seminarBonifications.length; i++) {
              worksheet.duplicateRow(templateRowBonifications, 1, true);
            }

            seminarBonifications.forEach((seminar, index) => {
              const rowNumber = templateRowBonifications + index;
              lastBonificationRow = rowNumber;

              worksheet.getCell(`A${rowNumber}`).value = index + 1;
              worksheet.getCell(`B${rowNumber}`).value =
                seminar.name.toUpperCase();

              if (seminar.dates && seminar.dates.length > 0) {
                const dates = seminar.dates.map((d) => d.date);
                const formattedDates = this.formatDates(dates);
                worksheet.getCell(`C${rowNumber}`).value = formattedDates;
              }

              worksheet.getCell(`E${rowNumber}`).value =
                seminar.seminarDocent.docent.name.toUpperCase();

              if (
                seminar.seminarDocent.vinculation === VinculationType.INTERNAL
              ) {
                worksheet.getCell(`F${rowNumber}`).value = 'INTERNO';
              } else {
                worksheet.getCell(`F${rowNumber}`).value = 'EXTERNO';
              }

              worksheet.getCell(`G${rowNumber}`).value =
                seminar.seminarDocent.docent.nationality.toUpperCase();
              worksheet.getCell(`H${rowNumber}`).value =
                seminar.seminarDocent.docent.document_type.toUpperCase();
              worksheet.getCell(`I${rowNumber}`).value = Number(
                seminar.seminarDocent.docent.document_number,
              );
              worksheet.getCell(`J${rowNumber}`).value =
                seminar.seminarDocent.docent.address;

              worksheet.getCell(`K${rowNumber}`).value =
                seminar.seminarDocent.docent.phone;

              worksheet.getCell(`L${rowNumber}`).value =
                seminar.seminarDocent.docent.schoolGrade.level;

              const targetCellCredit =
                feeCreditValueSmmlvMap.get(programModality);

              if (targetCellCredit) {
                worksheet.getCell(`O${rowNumber}`).value = {
                  formula: targetCellCredit,
                };
              } else {
                worksheet.getCell(`O${rowNumber}`).value = 0;
              }

              worksheet.getCell(`P${rowNumber}`).value = seminar.credits;

              worksheet.getCell(`Q${rowNumber}`).value = {
                formula: `O${rowNumber}*P${rowNumber}`,
              };

              if (seminar.airTransportValue) {
                worksheet.getCell(`R${rowNumber}`).value =
                  seminar.airTransportValue;
              }

              if (seminar.airTransportRoute) {
                worksheet.getCell(`S${rowNumber}`).value =
                  seminar.airTransportRoute.toUpperCase();
              }

              if (seminar.landTransportValue) {
                worksheet.getCell(`T${rowNumber}`).value =
                  seminar.landTransportValue;
              }

              if (seminar.landTransportRoute) {
                worksheet.getCell(`U${rowNumber}`).value =
                  seminar.landTransportRoute.toUpperCase();
              }

              if (seminar.foodAndLodgingAid) {
                worksheet.getCell(`V${rowNumber}`).value =
                  seminar.foodAndLodgingAid;
              }

              if (seminar.eventStayDays) {
                worksheet.getCell(`W${rowNumber}`).value =
                  seminar.eventStayDays;
              }

              if (seminar.hotelLocation) {
                worksheet.getCell(`X${rowNumber}`).value =
                  seminar.hotelLocation.toUpperCase();
              }
            });

            const totalBonificationRow = lastBonificationRow + 1;

            worksheet.getCell(`P${totalBonificationRow}`).value = {
              formula: `SUM(P${templateRowBonifications}:P${lastBonificationRow})`,
            };

            worksheet.getCell(`Q${totalBonificationRow}`).value = {
              formula: `SUM(Q${templateRowBonifications}:Q${lastBonificationRow})`,
            };

            worksheet.getCell(`R${totalBonificationRow}`).value = {
              formula: `SUM(R${templateRowBonifications}:R${lastBonificationRow})`,
            };

            worksheet.getCell(`T${totalBonificationRow}`).value = {
              formula: `SUM(T${templateRowBonifications}:T${lastBonificationRow})`,
            };

            worksheet.getCell(`V${totalBonificationRow}`).value = {
              formula: `SUM(V${templateRowBonifications}:V${lastBonificationRow})`,
            };

            worksheet.getCell(`W${totalBonificationRow}`).value = {
              formula: `SUM(W${templateRowBonifications}:W${lastBonificationRow})`,
            };
          }

          const templateRowExternal = 26;
          const offsetRows =
            seminarBonifications.length > 0
              ? seminarBonifications.length - 1
              : 0;
          const startRowExternal = templateRowExternal + offsetRows;
          let lastExternalRow = startRowExternal;

          if (seminarDocentExternal.length > 0) {
            for (let i = 1; i < seminarDocentExternal.length; i++) {
              worksheet.duplicateRow(startRowExternal, 1, true);
            }

            seminarDocentExternal.forEach((seminar, index) => {
              const rowNumber = startRowExternal + index;
              lastExternalRow = rowNumber;

              worksheet.getCell(`A${rowNumber}`).value = index + 1;
              worksheet.getCell(`B${rowNumber}`).value =
                seminar.name.toUpperCase();

              if (seminar.dates && seminar.dates.length > 0) {
                const dates = seminar.dates.map((d) => d.date);
                const formattedDates = this.formatDates(dates);
                worksheet.getCell(`C${rowNumber}`).value = formattedDates;
              }

              worksheet.getCell(`E${rowNumber}`).value =
                seminar.seminarDocent.docent.name.toUpperCase();

              if (
                seminar.seminarDocent.vinculation === VinculationType.INTERNAL
              ) {
                worksheet.getCell(`F${rowNumber}`).value = 'INTERNO';
              } else {
                worksheet.getCell(`F${rowNumber}`).value = 'EXTERNO';
              }

              worksheet.getCell(`G${rowNumber}`).value =
                seminar.seminarDocent.docent.nationality.toUpperCase();
              worksheet.getCell(`H${rowNumber}`).value =
                seminar.seminarDocent.docent.document_type.toUpperCase();
              worksheet.getCell(`I${rowNumber}`).value = Number(
                seminar.seminarDocent.docent.document_number,
              );
              worksheet.getCell(`J${rowNumber}`).value =
                seminar.seminarDocent.docent.address;

              worksheet.getCell(`K${rowNumber}`).value =
                seminar.seminarDocent.docent.phone;

              worksheet.getCell(`L${rowNumber}`).value =
                seminar.seminarDocent.docent.schoolGrade.level;

              const targetCellCredit =
                feeCreditValueSmmlvMap.get(programModality);

              if (targetCellCredit) {
                worksheet.getCell(`O${rowNumber}`).value = {
                  formula: targetCellCredit,
                };
              } else {
                worksheet.getCell(`O${rowNumber}`).value = 0;
              }

              worksheet.getCell(`P${rowNumber}`).value = seminar.credits;

              worksheet.getCell(`Q${rowNumber}`).value = {
                formula: `O${rowNumber}*P${rowNumber}`,
              };

              if (seminar.airTransportValue) {
                worksheet.getCell(`R${rowNumber}`).value =
                  seminar.airTransportValue;
              }

              if (seminar.airTransportRoute) {
                worksheet.getCell(`S${rowNumber}`).value =
                  seminar.airTransportRoute.toUpperCase();
              }

              if (seminar.landTransportValue) {
                worksheet.getCell(`T${rowNumber}`).value =
                  seminar.landTransportValue;
              }

              if (seminar.landTransportRoute) {
                worksheet.getCell(`U${rowNumber}`).value =
                  seminar.landTransportRoute.toUpperCase();
              }

              if (seminar.foodAndLodgingAid) {
                worksheet.getCell(`V${rowNumber}`).value =
                  seminar.foodAndLodgingAid;
              }

              if (seminar.eventStayDays) {
                worksheet.getCell(`W${rowNumber}`).value =
                  seminar.eventStayDays;
              }

              if (seminar.hotelLocation) {
                worksheet.getCell(`X${rowNumber}`).value =
                  seminar.hotelLocation.toUpperCase();
              }
            });

            const totalExternalRow = lastExternalRow + 1;

            worksheet.getCell(`P${totalExternalRow}`).value = {
              formula: `SUM(P${startRowExternal}:P${lastExternalRow})`,
            };

            worksheet.getCell(`Q${totalExternalRow}`).value = {
              formula: `SUM(Q${startRowExternal}:Q${lastExternalRow})`,
            };

            worksheet.getCell(`R${totalExternalRow}`).value = {
              formula: `SUM(R${startRowExternal}:R${lastExternalRow})`,
            };

            worksheet.getCell(`T${totalExternalRow}`).value = {
              formula: `SUM(T${startRowExternal}:T${lastExternalRow})`,
            };

            worksheet.getCell(`V${totalExternalRow}`).value = {
              formula: `SUM(V${startRowExternal}:V${lastExternalRow})`,
            };

            worksheet.getCell(`W${totalExternalRow}`).value = {
              formula: `SUM(W${startRowExternal}:W${lastExternalRow})`,
            };
          }
        }
      }

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename=protocolo-viabilidad-${Date.now()}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error generating document', {
        cause: error,
      });
    }
  }

  private formatDates(dates: Date[]) {
    if (!dates || dates.length === 0) return '';

    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const parsedDates = dates.map((date) => new Date(date));

    parsedDates.sort((a, b) => a.getTime() - b.getTime());

    const grouped = parsedDates.reduce(
      (acc, date) => {
        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${month}-${year}`;

        if (!acc[key]) {
          acc[key] = {
            days: [],
            month: months[month],
            year: year,
          };
        }

        acc[key].days.push(date.getDate());
        return acc;
      },
      {} as Record<string, { days: number[]; month: string; year: number }>,
    );

    const result = Object.values(grouped)
      .map((group) => {
        const days = group.days.join(', ');
        return `${days} de ${group.month} de ${group.year}`;
      })
      .join(' y ');

    return result;
  }
}
