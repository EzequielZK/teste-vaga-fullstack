'use server';

import fs from 'fs';
import csv from 'csv-parser';
import { DataResponse } from '@/lib/types';
import isCpf from '@/lib/validations/isCpf';
import isCnpj from '@/lib/validations/isCnpj';
import { format } from 'date-fns';

export default async function getData(
  page: number = 0,
  size: number = 10,
  search?: string
): Promise<DataResponse> {
  const results: any[] = [];

  let data: DataResponse = await new Promise(resolve => {
    fs.createReadStream('data.csv')
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => {
        const items = search
          ? results.filter(item =>
              item.nmClient.toLowerCase().includes(search.toLowerCase())
            )
          : results;
        resolve({
          items: items.slice(page * size, (page + 1) * size),
          page,
          size,
          totalItems: items.length,
        });
      });
  });

  data = {
    ...data,
    items: data.items.map(item => ({
      ...item,
      vlTotal: convertValueToCurrency('pt-BR', 'BRL', item.vlTotal),
      vlPresta: convertValueToCurrency('pt-BR', 'BRL', item.vlPresta),
      vlMora: convertValueToCurrency('pt-BR', 'BRL', item.vlMora),
      vlMulta: convertValueToCurrency('pt-BR', 'BRL', item.vlMulta),
      vlOutAcr: convertValueToCurrency('pt-BR', 'BRL', item.vlOutAcr),
      vlIof: convertValueToCurrency('pt-BR', 'BRL', item.vlIof),
      vlDescon: convertValueToCurrency('pt-BR', 'BRL', item.vlDescon),
      vlAtual: convertValueToCurrency('pt-BR', 'BRL', item.vlAtual),
      dtContrato: formatDate(item.dtContrato),
      dtVctPre: formatDate(item.dtVctPre),
      validCpfCnpj: validateCpfCnpj(item.nrCpfCnpj),
      validPayment: validateTotalValue(
        item.vlTotal,
        item.qtPrestacoes,
        item.vlPresta
      ),
    })),
  };

  return data;
}

function convertValueToCurrency(
  locale: string,
  currency: string,
  value: string
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(Number(value));
}

function validateCpfCnpj(cpfCnpj: string): Boolean {
  if (!isCpf(cpfCnpj) && !isCnpj(cpfCnpj)) {
    return false;
  }
  return true;
}

function validateTotalValue(
  totalValue: string,
  installmentsQuantity: string,
  installmentValue: string
) {
  const realInstallmentValue =
    Number(totalValue) / Number(installmentsQuantity);

  if (realInstallmentValue === Number(installmentValue)) {
    return true;
  }
  return false;
}

function formatDate(date: string): string {
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);

  const formatedDate = format(
    new Date(`${year}-${month}-${day}`),
    'dd/MM/yyyy'
  );

  return formatedDate;
}
