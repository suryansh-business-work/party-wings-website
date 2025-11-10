import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
// Use Bootstrap grid classes for layout to match project styling
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Header from './components/Header'

const sampleOrders = [
  { id: 'ORD-1001', customer: 'Asha Patel', total: '₹2,450', status: 'Pending' },
  { id: 'ORD-1000', customer: 'Rahul Kumar', total: '₹4,200', status: 'Completed' },
  { id: 'ORD-0999', customer: 'Neha Singh', total: '₹1,200', status: 'Cancelled' },
]

const VendorDashboard: React.FC = () => {
  const [vendorName, setVendorName] = useState<string>('Vendor')
  const [orders, setOrders] = useState(sampleOrders)

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

  const handleRefresh = () => {
    // placeholder: in future fetch real dashboard data
    // For now just simulate a refresh by shuffling orders
    setOrders((prev) => [...prev].reverse())
  }

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f3f6fb 0%, #ffffff 60%)', minHeight: '100vh' }}>
      <Header />
      <div className="container py-5">
        <Box className="card shadow-sm p-4 mb-4">
          <Box className="d-flex align-items-center justify-content-between">
          <Box className="d-flex align-items-center gap-3">
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>{vendorName?.charAt(0) || 'V'}</Avatar>
            <Box>
              <Typography variant="h6">Welcome, {vendorName}</Typography>
              <Typography variant="body2" color="text.secondary">Here's a quick look at your store</Typography>
            </Box>
          </Box>

          <Box>
            <Button variant="outlined" onClick={handleRefresh}>Refresh</Button>
          </Box>
          </Box>
        </Box>

        <div className="row g-4">
          <div className="col-12 col-sm-4">
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Orders</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{orders.length}</Typography>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 col-sm-4">
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Pending</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{orders.filter((o) => o.status === 'Pending').length}</Typography>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 col-sm-4">
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Revenue</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{orders.reduce((s, o) => s + Number(o.total.replace(/[^0-9]/g, '')), 0)}</Typography>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 col-md-8">
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Orders</Typography>
                <List>
                  {orders.map((ord) => (
                    <React.Fragment key={ord.id}>
                      <ListItem className="d-flex justify-content-between align-items-center">
                        <ListItemText primary={`${ord.id} — ${ord.customer}`} secondary={`${ord.total} • ${ord.status}`} />
                        <Button size="small">View</Button>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 col-md-4">
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Box className="d-grid gap-2">
                  <Button variant="contained">Add New Product</Button>
                  <Button variant="outlined">Manage Store</Button>
                  <Button variant="outlined">Payouts</Button>
                </Box>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default VendorDashboard
