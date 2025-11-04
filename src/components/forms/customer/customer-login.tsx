import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import PhoneIcon from '@mui/icons-material/Phone'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { sendSms } from '../../../utils/sendSms'

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

const CustomerLogin: React.FC<Props> = ({ onLogin }) => {
  const [otpSentCode, setOtpSentCode] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  const formik = useFormik<Values>({
    initialValues: { phone: '', otp: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      // If already logged in, nothing to do
      if (loggedIn) {
        setSubmitting(false)
        return
      }

      // If OTP sent & provided, try verify
      if (otpSentCode) {
        setVerifying(true)
        setTimeout(() => {
          if (values.otp === otpSentCode) {
            setLoggedIn(true)
            onLogin && onLogin(values.phone)
            alert('Logged in successfully')
          } else {
            alert('Incorrect OTP')
          }
          setVerifying(false)
          setSubmitting(false)
        }, 400)
        return
      }

      // Otherwise require sending OTP first
      alert('Please send OTP first')
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
      const code = await sendSms(formik.values.phone, 'Login OTP', 'Your login OTP')
      setOtpSentCode(String(code))
      alert('OTP sent to your phone')
    } catch (err) {
      console.error(err)
      alert('Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  const handleVerify = async () => {
    // trigger form submit which handles verification when otpSentCode exists
    formik.handleSubmit()
  }

  return (
    <Box sx={{ maxWidth: 480, p: 2 }}>
      <form onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing={2}>
          <Typography variant="h6">Customer Login</Typography>

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

          {otpSentCode && !loggedIn && (
            <Stack direction="row" spacing={1} alignItems="center">
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
            </Stack>
          )}

          <Stack direction="row" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={formik.isSubmitting || !loggedIn}>
              {formik.isSubmitting ? <CircularProgress size={18} /> : 'Continue'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  )
}

export default CustomerLogin
