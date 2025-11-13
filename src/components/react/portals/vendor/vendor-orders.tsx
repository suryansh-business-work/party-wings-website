import React, { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Pagination from '@mui/material/Pagination'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import VisibilityIcon from '@mui/icons-material/Visibility'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'

import Header from './components/Header'
import { vendorOrders } from './dashboard/data'
import type { Order } from './dashboard/data'

const PAGE_SIZE = 10

const statusColor = (status: Order['status']) => {
  switch (status) {
    case 'Completed':
      return 'success'
    case 'Pending':
      return 'warning'
    case 'Processing':
      return 'info'
    case 'Cancelled':
      return 'error'
    default:
      return 'default'
  }
}

const VendorOrders: React.FC = () => {
  const [tab, setTab] = useState<'all' | 'pending' | 'completed'>('pending')
  const [query, setQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [orders, setOrders] = useState<Order[]>(vendorOrders)
  const [confirm, setConfirm] = useState<{ open: boolean; orderId?: string }>({ open: false })

  // Filtered list by tab and search
  const filtered = useMemo(() => {
    let list = [...orders]

    // tab filter
    if (tab === 'pending') list = list.filter((o) => o.status === 'Pending')
    if (tab === 'completed') list = list.filter((o) => o.status === 'Completed')

    // search
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q))
    }

    return list
  }, [orders, tab, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const handleMarkComplete = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'Completed' } : o)))
    setConfirm({ open: false })
  }

  const openConfirm = (id: string) => setConfirm({ open: true, orderId: id })
  const closeConfirm = () => setConfirm({ open: false })

  const resetFilters = () => {
    setTab('pending')
    setQuery('')
    setPage(1)
  }

  return (
    <Box sx={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Header />
      <Box className="container" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Orders Management
        </Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1}>
                <Button variant={tab === 'pending' ? 'contained' : 'outlined'} color="warning" onClick={() => { setTab('pending'); setPage(1) }} startIcon={<HourglassTopIcon />}>
                  Pending
                </Button>
                <Button variant={tab === 'all' ? 'contained' : 'outlined'} onClick={() => { setTab('all'); setPage(1) }}>
                  All
                </Button>
                <Button variant={tab === 'completed' ? 'contained' : 'outlined'} color="success" onClick={() => { setTab('completed'); setPage(1) }} startIcon={<CheckCircleIcon />}>
                  Completed
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField size="small" placeholder="Search order or customer" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} sx={{ minWidth: 240, bgcolor: 'white' }} />
                <Button variant="outlined" onClick={resetFilters}>
                  Reset
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pageData.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{o.id}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{o.customer}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(o.timestamp).toLocaleString('en-IN')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{o.items}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{o.total.toLocaleString('en-IN')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={o.status} size="small" color={statusColor(o.status)} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {o.status !== 'Completed' && (
                          <Tooltip title="Mark as completed">
                            <IconButton size="small" color="success" onClick={() => openConfirm(o.id)}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {pageData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">No orders found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</Typography>
              <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Stack>
          </CardContent>
        </Card>

        <Dialog open={confirm.open} onClose={closeConfirm}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>
            <Typography>Mark order <strong>{confirm.orderId}</strong> as completed?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirm}>Cancel</Button>
            <Button onClick={() => confirm.orderId && handleMarkComplete(confirm.orderId)} variant="contained" color="success">Confirm</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}

export default VendorOrders
