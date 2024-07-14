'use client';

import { useEffect, useState } from 'react';
import getData from './actions/getData';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { DataResponse } from '@/lib/types';
import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function CustomTable() {
  const [data, setData] = useState<DataResponse>();
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCsvData(0, 10);
  }, []);

  const headers = data && data.items.length ? Object.keys(data.items[0]) : [];

  const getCsvData = async (page: number, size: number, search?: string) => {
    const csv = await getData(page, size, search);

    setData(csv);
    setLoading(false);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    getCsvData(newPage, rowsPerPage, search);
  };

  const handleChangeRowsPerPage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    await getCsvData(0, +event.target.value, search);
  };

  const handleSearch = async (search: string) => {
    setSearch(search);
    await getCsvData(0, rowsPerPage, search);
  };

  return (
    <div className='max-h-screen flex flex-col p-8'>
      <Paper className='flex flex-col flex-1 justify-between w-full overflow-hidden'>
        <div className='w-full justify-between items-center flex p-4'>
          <TextField
            variant='standard'
            name='search'
            value={search}
            placeholder='Pesquisar nome do cliente'
            onChange={e => handleSearch(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <Button
            variant='outlined'
            color='primary'
            onClick={() => {
              setSearch('');
              getCsvData(0, 10);
            }}
          >
            Limpar filtros
          </Button>
        </div>
        {loading ? (
          <div className='flex justify-center'>
            <CircularProgress />
          </div>
        ) : !data?.items.length ? (
          <div className='flex justify-center'>
            <Typography variant='body1'>
              Não há resultados a serem exibidos
            </Typography>
          </div>
        ) : (
          <TableContainer className='flex-1'>
            <Table stickyHeader aria-label='sticky table'>
              <TableHead>
                <TableRow>
                  {headers.map(column => (
                    <TableCell
                      key={column}
                      // align={column.align}
                      style={{ minWidth: 200 }}
                    >
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((row, rowIndex) => {
                  return (
                    <TableRow
                      hover
                      role='checkbox'
                      tabIndex={-1}
                      key={rowIndex}
                    >
                      {Object.keys(row).map((item, index) => {
                        return (
                          <TableCell key={index}>
                            {typeof row[item] === 'boolean' ? (
                              row[item] ? (
                                <Check />
                              ) : (
                                <Clear />
                              )
                            ) : (
                              row[item]
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          sx={{ overflow: 'hidden' }}
          rowsPerPageOptions={[10, 25, 100]}
          component='div'
          count={data?.totalItems ?? 0}
          rowsPerPage={rowsPerPage}
          page={data?.page ?? 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
