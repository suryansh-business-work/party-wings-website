import React, { useState, useRef, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import PhoneIcon from '@mui/icons-material/Phone'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { LinearProgress, Typography } from '@mui/material'

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
    .matches(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  otp: Yup.string(),
})

const VendorLogin: React.FC<Props> = ({ onLogin }) => {
  const [otpSentCode, setOtpSentCode] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [step, setStep] = useState<number>(1)
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({})
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success')

  const formik = useFormik<Values>({
    initialValues: { phone: '', otp: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      // If on step 1, pressing Enter will request OTP
      if (step === 1) {
        await handleSendOtp()
        setSubmitting(false)
        return
      }

      // If on step 2, pressing Enter will verify OTP
      if (step === 2) {
        // validate OTP is 6 digits
        if (!isOtpValid(values.otp)) {
          formik.setFieldTouched('otp', true)
          formik.setFieldError('otp', 'Enter a 6-digit numeric OTP')
          setSubmitting(false)
          return
        }
        // reuse verification flow
        setVerifying(true)
        try {
          const res = await fetch('http://localhost:4001/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: values.phone, otp: values.otp }),
          })
          const data = await res.json()
          if (data.status === 'success') {
            const token = data.data?.token
            const user = data.data?.user
            if (token) localStorage.setItem('token', token)
            if (user) localStorage.setItem('user', JSON.stringify(user))
            setLoggedIn(true)
            setSnackbarMessage('OTP verified — logged in')
            setSnackbarSeverity('success')
            setSnackbarOpen(true)
            // redirect home shortly
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
      }
    },
  })

  const isOtpValid = (otp: string) => /^[0-9]{6}$/.test(otp)

  const otpRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (step === 2 && otpRef.current) {
      otpRef.current.focus()
    }
  }, [step])

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
        // mark step 1 completed
        setCompletedSteps((c) => ({ ...c, 0: true }))
        // move to step 2 to show OTP input only when backend returned data
        setStep(2)
      } else {
        // show backend message (e.g., "User not found") and do NOT advance to step 2
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

  // ensure phone input only digits and max 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    formik.setFieldValue('phone', digits)
  }

  // ensure OTP input only digits and max 6
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
    formik.setFieldValue('otp', digits)
  }

  const handleVerify = async () => {
    // trigger form submit which handles verification when otpSentCode exists
    formik.handleSubmit()
  }


  return (
    <>
      {(sending || verifying) && <LinearProgress />}
      <form onSubmit={formik.handleSubmit} noValidate className="p-3 border rounded bg-white position-relative mb-3">
        <Box sx={{ width: '100%', mb: 5 }}>
          {/* Left-align the Stepper instead of centering labels */}
          <Stepper activeStep={step - 1} sx={{ mt: 1, mb: 2, justifyContent: 'flex-start', display: 'flex' }}>
            <Step completed={Boolean(completedSteps[0])}>
              <StepLabel
                optional={<Typography variant="caption" color="text.secondary">10-digit phone</Typography>}>
                Phone
              </StepLabel>
            </Step>
            <Step completed={Boolean(completedSteps[1])}>
              <StepLabel
                optional={<Typography variant="caption" color="text.secondary">6-digit code</Typography>}>
                OTP
              </StepLabel>
            </Step>
          </Stepper>
        </Box>

        <div className="mb-3">
          {step === 1 ? (
            <TextField
              id="phone"
              name="phone"
              label="Phone Number"
              helperText={formik.touched.phone && formik.errors.phone ? formik.errors.phone : 'Enter your registered phone'}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              value={formik.values.phone}
              onChange={handlePhoneChange}
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
                    {loggedIn ? <CheckCircleIcon color="success" /> : null}
                  </InputAdornment>
                ),
                inputProps: { inputMode: 'numeric', pattern: '\\d*', maxLength: 10 },
              }}
            />
          ) : (
            // Step 2: show phone as plain text with font-awesome phone icon and a back icon+text
            <div className="d-flex align-items-center justify-content-between border rounded p-2">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-phone text-muted" aria-hidden="true" />
                <span className="fw-semibold">{formik.values.phone || '—'}</span>
              </div>
              <button type="button" className="btn btn-link text-decoration-none" onClick={() => { setStep(1); setOtpSentCode(null); formik.setFieldValue('otp', ''); }}>
                <i className="fa-solid fa-arrow-left me-2" aria-hidden="true"></i>
                Back
              </button>
            </div>
          )}
        </div>
        {step === 2 && otpSentCode && !loggedIn && (
          <div className="d-flex gap-2 align-items-center mb-3">
            <TextField
              id="otp"
              name="otp"
              label="OTP"
              value={formik.values.otp}
              onChange={handleOtpChange}
              size="small"
              inputRef={(el) => (otpRef.current = el)}
              error={Boolean(formik.touched.otp && formik.errors.otp)}
              helperText={formik.touched.otp && formik.errors.otp ? formik.errors.otp : ''}
              inputProps={{ inputMode: 'numeric', pattern: '\\d*', maxLength: 6 }}
              disabled={verifying}
            />
          </div>
        )}

        <div className="d-flex justify-content-end">
          <Button
            type="submit"
            variant="contained"
            disabled={sending || verifying || formik.isSubmitting || (step === 1 ? sending || !formik.values.phone || Boolean(formik.errors.phone) : verifying || !isOtpValid(formik.values.otp))}
          >
            {formik.isSubmitting || (step === 1 ? sending : verifying) ? <CircularProgress size={18} /> : (step === 1 ? 'Send OTP' : 'Verify & Login')}
          </Button>
        </div>
      </form>

      {/* Snackbar for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default VendorLogin
