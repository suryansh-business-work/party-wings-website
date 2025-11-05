import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
// layout uses Bootstrap grid classes instead of MUI Box/Stack/Typography
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import SendIcon from '@mui/icons-material/Send'
import PhoneIcon from '@mui/icons-material/Phone'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// using backend auth endpoints

type Props = {
  onLogin?: (phone: string) => void
}

type Values = {
  phone: string
  otp: string
}

const schema = Yup.object({
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9()+\-\s]{7,15}$/, 'Enter a valid phone number'),
  otp: Yup.string(),
})

const VendorLoginForm: React.FC<Props> = ({ onLogin }) => {
  const [otpSentCode, setOtpSentCode] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success')

  const formik = useFormik<Values>({
    initialValues: { phone: '', otp: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      if (loggedIn) {
        setSubmitting(false)
        return
      }

      if (otpSentCode) {
        setVerifying(true)
        try {
          const res = await fetch('http://localhost:4001/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: values.phone, otp: values.otp }),
          })
          const data = await res.json()
          if (data && data.status === 'success') {
            const token = data.data?.token
            const user = data.data?.user
            if (token) localStorage.setItem('token', token)
            if (user) localStorage.setItem('user', JSON.stringify(user))
            setLoggedIn(true)
            setSnackbarMessage('OTP verified — logged in')
            setSnackbarSeverity('success')
            setSnackbarOpen(true)
            setTimeout(() => (window.location.href = '/'), 1200)
          } else {
            setSnackbarMessage(data?.message || 'OTP verification failed')
            setSnackbarSeverity('error')
            setSnackbarOpen(true)
          }
        } catch (err) {
          console.error(err)
          setSnackbarMessage('OTP verification failed')
          setSnackbarSeverity('error')
          setSnackbarOpen(true)
        } finally {
          setVerifying(false)
          setSubmitting(false)
        }
        return
      }

      setSnackbarMessage('Please request an OTP first')
      setSnackbarSeverity('warning')
      setSnackbarOpen(true)
      setSubmitting(false)
    },
  })

  const handleSendOtp = async () => {
    if (!formik.values.phone || formik.errors.phone) {
      formik.setFieldTouched('phone', true)
      formik.setFieldError('phone', formik.errors.phone || 'Enter a valid phone')
      return
    }
    try {
      setSending(true)
      const res = await fetch('http://localhost:4001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formik.values.phone }),
      })
      const data = await res.json()
      if (data && data.status === 'success') {
        setOtpSentCode('requested')
        setSnackbarMessage(data.message || 'OTP generated for login')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      } else {
        setSnackbarMessage(data?.message || 'Failed to request OTP')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    } catch (err) {
      console.error(err)
      setSnackbarMessage('Failed to send OTP')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setSending(false)
    }
  }

  const handleVerify = async () => {
    // trigger form submit which handles verification when otpSentCode exists
    formik.handleSubmit()
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <form onSubmit={formik.handleSubmit} noValidate className="p-3 border rounded bg-white">
            <h5 className="mb-3">Vendor Login</h5>

            <div className="mb-3">
              <TextField
                id="phone"
                name="phone"
                label="Phone Number"
                helperText={formik.touched.phone && formik.errors.phone ? formik.errors.phone : 'Enter your registered phone'}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {loggedIn ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <Button onClick={handleSendOtp} size="small" variant="outlined" endIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}>
                          Send OTP
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {otpSentCode && !loggedIn && (
              <div className="d-flex gap-2 align-items-center mb-3">
                <TextField
                  id="otp"
                  name="otp"
                  label="OTP"
                  value={formik.values.otp}
                  onChange={formik.handleChange}
                  size="small"
                />
                <Button onClick={handleVerify} variant="contained" disabled={verifying} startIcon={<SendIcon />}>
                  {verifying ? <CircularProgress size={18} /> : 'Verify OTP'}
                </Button>
              </div>
            )}

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="contained" disabled={formik.isSubmitting || !loggedIn}>
                {formik.isSubmitting ? <CircularProgress size={18} /> : 'Continue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {/* Snackbar for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default VendorLoginForm
