import { Box, Typography } from "@mui/material"
import Header from "./components/Header"

const VendorStoreManagement: React.FC = () => {
  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f3f6fb 0%, #ffffff 60%)', minHeight: '100vh' }}>
      <Header />
      <div className="container py-5">
        <Typography variant="h4" gutterBottom>
          Store Management
        </Typography>
      </div>
    </Box>
  )
}

export default VendorStoreManagement;
