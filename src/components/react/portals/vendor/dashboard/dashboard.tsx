import React, { useEffect, useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import RefreshIcon from '@mui/icons-material/Refresh'
import Header from '../components/Header'
import { vendorOrders, filterOrdersByDateRange, getDateRange, getMonthlyData } from './data'
import type { Order } from './data'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const VendorDashboard: React.FC = () => {
  const [vendorName, setVendorName] = useState<string>('Vendor')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const user = JSON.parse(raw)
        if (user?.name) setVendorName(user.name)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Filter orders based on date range
  const filteredOrders = useMemo(() => {
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate).getTime()
      const end = new Date(customEndDate).setHours(23, 59, 59, 999)
      return filterOrdersByDateRange(vendorOrders, start, end)
    } else if (dateFilter !== 'all') {
      const { start, end } = getDateRange(dateFilter)
      return filterOrdersByDateRange(vendorOrders, start, end)
    }
    return vendorOrders
  }, [dateFilter, customStartDate, customEndDate])

  // Calculate statistics
  const totalRevenue = useMemo(() => 
    filteredOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + o.total, 0),
    [filteredOrders]
  )
  
  const pendingCount = useMemo(() => 
    filteredOrders.filter(o => o.status === 'Pending').length,
    [filteredOrders]
  )

  const processingCount = useMemo(() => 
    filteredOrders.filter(o => o.status === 'Processing').length,
    [filteredOrders]
  )

  // Get monthly chart data
  const monthlyChartData = useMemo(() => getMonthlyData(filteredOrders), [filteredOrders])

  // Chart configurations
  const monthlyData = {
    labels: monthlyChartData.map(d => d.month),
    datasets: [
      {
        label: 'Earnings (₹)',
        data: monthlyChartData.map(d => d.earnings),
        borderColor: '#5e35b1',
        backgroundColor: 'rgba(94, 53, 177, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#5e35b1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const orderCountData = {
    labels: monthlyChartData.map(d => d.month),
    datasets: [
      {
        label: 'Orders Count',
        data: monthlyChartData.map(d => d.count),
        backgroundColor: 'rgba(94, 53, 177, 0.8)',
        borderColor: '#5e35b1',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  const handleRefresh = () => {
    setDateFilter('all')
    setCustomStartDate('')
    setCustomEndDate('')
  }

  const handleFilterChange = (event: any) => {
    setDateFilter(event.target.value)
    if (event.target.value !== 'custom') {
      setCustomStartDate('')
      setCustomEndDate('')
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: Order['status']) => {
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

const monthlyOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return `₹${context.parsed.y.toLocaleString('en-IN')}`
        },
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        callback: function (value: any) {
          return '₹' + (value / 1000).toFixed(0) + 'k'
        },
      },
    },
  },
}

const orderOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return `${context.parsed.y} orders`
        },
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        stepSize: 1,
      },
    },
  },
}

  return (
    <Box sx={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Header />
      <Box className="container" sx={{ py: 3 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                Welcome back, {vendorName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredOrders.length} orders • {dateFilter === 'all' ? 'All time' : dateFilter.replace(/([A-Z])/g, ' $1').trim()}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Filter Period</InputLabel>
                <Select
                  value={dateFilter}
                  label="Filter Period"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="last7days">Last 7 Days</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="thisYear">This Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{
                  borderColor: '#e0e0e0',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#5e35b1',
                    color: '#5e35b1',
                    bgcolor: 'rgba(94, 53, 177, 0.04)'
                  }
                }}
              >
                Reset
              </Button>
            </Stack>
          </Stack>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'white' }}
              />
              <TextField
                label="End Date"
                type="date"
                size="small"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'white' }}
              />
            </Stack>
          )}
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Total Orders
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mt: 1 }}>
                      {filteredOrders.length}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 14, color: '#10b981' }} />
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                        +8.2%
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(94, 53, 177, 0.1)', color: '#5e35b1', width: 48, height: 48 }}>
                    <ShoppingCartIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Pending
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mt: 1 }}>
                      {pendingCount}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                        {filteredOrders.length > 0 ? ((pendingCount / filteredOrders.length) * 100).toFixed(0) : 0}% of total
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(251, 146, 60, 0.1)', color: '#fb923c', width: 48, height: 48 }}>
                    <PendingActionsIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Processing
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mt: 1 }}>
                      {processingCount}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                        In progress
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 48, height: 48 }}>
                    <RefreshIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ 
              bgcolor: '#5e35b1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(94, 53, 177, 0.25)',
              border: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 8px 20px rgba(94, 53, 177, 0.35)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Revenue
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mt: 1 }}>
                      ₹{(totalRevenue / 1000).toFixed(1)}k
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 14, color: '#a5f3fc' }} />
                      <Typography variant="caption" sx={{ color: '#a5f3fc', fontWeight: 600 }}>
                        +12.5%
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', width: 48, height: 48 }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                  Revenue Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={monthlyData} options={monthlyOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                  Orders Per Month
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={orderCountData} options={orderOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Orders */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                  Recent Orders
                </Typography>
                <List sx={{ p: 0 }}>
                  {filteredOrders.slice(0, 5).map((ord, idx) => (
                    <React.Fragment key={ord.id}>
                      <ListItem 
                        sx={{ 
                          px: 0, 
                          py: 2,
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                                {ord.id}
                              </Typography>
                              <Chip 
                                label={ord.status} 
                                size="small" 
                                color={getStatusColor(ord.status)}
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Stack>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {ord.customer} • {formatDate(ord.timestamp)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Stack alignItems="flex-end" spacing={0.5}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                            ₹{ord.total.toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ord.items} items
                          </Typography>
                        </Stack>
                      </ListItem>
                      {idx < filteredOrders.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ 
                      bgcolor: '#5e35b1', 
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#4a2889' } 
                    }}
                  >
                    Add New Product
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ 
                      borderColor: '#e0e0e0',
                      color: '#666',
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 600,
                      '&:hover': { 
                        borderColor: '#5e35b1',
                        color: '#5e35b1',
                        bgcolor: 'rgba(94, 53, 177, 0.04)'
                      }
                    }}
                  >
                    Manage Store
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ 
                      borderColor: '#e0e0e0',
                      color: '#666',
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 600,
                      '&:hover': { 
                        borderColor: '#5e35b1',
                        color: '#5e35b1',
                        bgcolor: 'rgba(94, 53, 177, 0.04)'
                      }
                    }}
                  >
                    View Payouts
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default VendorDashboard
