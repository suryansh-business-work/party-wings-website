import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
// IconButton removed (not used)
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PhoneIcon from '@mui/icons-material/Phone'
import BusinessIcon from '@mui/icons-material/Business'
// FormControl / Select related imports removed (multi-select removed)
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'

import { getApiHost } from '../../../utils/host'

type Values = {
  businessName: string
  phone: string
  agreeTerms?: boolean
  agreePrivacy?: boolean
  agreeVendorPolicy?: boolean
  agreeVendorPrivacy?: boolean
}

const validationSchema = Yup.object({
  businessName: Yup.string().required('Business name is required'),
  phone: Yup.string().required('Phone number is required').matches(/^[0-9]{10}$/, 'Enter a valid 10 digit phone number'),
  agreeTerms: Yup.boolean().oneOf([true], 'You must accept Terms & Conditions'),
  agreePrivacy: Yup.boolean().oneOf([true], 'You must accept Data Privacy'),
  agreeVendorPolicy: Yup.boolean().oneOf([true], 'You must accept Vendor Policy'),
  agreeVendorPrivacy: Yup.boolean().oneOf([true], 'You must accept Vendor Privacy Policy'),
})

// business options removed since multi-select was removed

const VendorRegistrationForm: React.FC = () => {
  const [otpRequested, setOtpRequested] = useState(false)
  const [smsVerified, setSmsVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [smsVerifyInput, setSmsVerifyInput] = useState('')

  const formik = useFormik<Values>({
    initialValues: { businessName: '', phone: '', agreeTerms: false, agreePrivacy: false, agreeVendorPolicy: false, agreeVendorPrivacy: false },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      // submission is handled after OTP verify which redirects on success
      setSubmitting(false)
    },
  })

  const handleSendOtp = async () => {
    // require agreements before sending OTP
    if (!formik.values.agreeTerms || !formik.values.agreePrivacy || !formik.values.agreeVendorPolicy || !formik.values.agreeVendorPrivacy) {
      alert('Please accept all policies before requesting OTP')
      return
    }

    if (!formik.values.phone || formik.errors.phone) {
      formik.setFieldTouched('phone', true)
      formik.setFieldError('phone', formik.errors.phone || 'Enter a valid phone')
      return
    }

    try {
      setSendingOtp(true)
      const res = await fetch(`${getApiHost()}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formik.values.businessName, phone: formik.values.phone, role: 'vendor' }),
      })
      const data = await res.json()
      if (data && (data.status === 'success' || data.statusCode === 200)) {
        setOtpRequested(true)
        setSmsVerified(false)
        alert(data.message || 'OTP generated for signup. Verify OTP to receive token')
      } else {
        console.error('signup error', data)
        alert(data?.message || 'Failed to request OTP')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to request OTP')
    } finally {
      setSendingOtp(false)
    }
  }

  // email flow removed (signup/OTP handled via server and email not required)

  const handleVerifyOtp = async () => {
    if (!otpRequested) {
      alert('Request an OTP first')
      return
    }
    setVerifyingOtp(true)
    try {
      const res = await fetch(`${getApiHost()}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formik.values.phone, otp: smsVerifyInput }),
      })
      const data = await res.json()
      if (data && data.status === 'success' && data.data) {
        // expect token and user in data
        const token = data.data.token
        const user = data.data.user
        if (token) {
          try {
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user || {}))
          } catch (e) {
            console.warn('failed to persist user/token', e)
          }
        }
        setSmsVerified(true)
        alert(data.message || 'Signup successful')
        // redirect to vendor dashboard
        window.location.href = '/portals/vendor/dashboard'
      } else {
        console.error('verify-otp error', data)
        alert(data?.message || 'OTP verification failed')
      }
    } catch (err) {
      console.error(err)
      alert('OTP verification failed')
    } finally {
      setVerifyingOtp(false)
    }
  }

  // email verification removed

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'stretch',
        }}
      >
        {/* Left: form (50%) */}
        <Box sx={{ flex: 1, p: 2, display: 'flex' }}>
          <form onSubmit={formik.handleSubmit} noValidate style={{ width: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h6">Vendor / Business registration</Typography>

              <TextField
                id="businessName"
                name="businessName"
                label="Business name"
                helperText={
                  formik.touched.businessName && formik.errors.businessName
                    ? formik.errors.businessName
                    : 'It should be registered Business name/Hotel Name/Cafe Name or relevant to your business'
                }
                error={formik.touched.businessName && Boolean(formik.errors.businessName)}
                value={formik.values.businessName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Business name input (no email/business multi-select per request) */}

              <TextField
                id="phone"
                name="phone"
                label="Phone Number"
                helperText={
                  formik.touched.phone && formik.errors.phone
                    ? formik.errors.phone
                    : 'Your registered Business Phone number'
                }
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                value={formik.values.phone}
                onChange={(e) => formik.setFieldValue('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                      {smsVerified ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <Button
                          onClick={handleSendOtp}
                          size="small"
                          variant="outlined"
                          endIcon={sendingOtp ? <CircularProgress size={16} /> : <SendIcon />}
                          disabled={sendingOtp}
                        >
                          Request OTP
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                }}
                />

                {otpRequested && !smsVerified && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="OTP code"
                      value={smsVerifyInput}
                      onChange={(e) => setSmsVerifyInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      size="small"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                    />
                    <Button onClick={handleVerifyOtp} variant="contained" disabled={verifyingOtp} startIcon={<SendIcon />}>
                      {verifyingOtp ? <CircularProgress size={18} /> : 'Verify OTP'}
                    </Button>
                  </Stack>
                )}

              {/* email removed per request; signup/OTP handled via server */}

              {/* Agreement checkboxes (separate) */}
              <Box sx={{ mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formik.values.agreeTerms}
                      onChange={(e) => formik.setFieldValue('agreeTerms', e.target.checked)}
                      name="agreeTerms"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the <a href="/policies/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
                    </Typography>
                  }
                />
                {formik.touched.agreeTerms && formik.errors.agreeTerms && (
                  <FormHelperText error>{formik.errors.agreeTerms as string}</FormHelperText>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formik.values.agreePrivacy}
                      onChange={(e) => formik.setFieldValue('agreePrivacy', e.target.checked)}
                      name="agreePrivacy"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the <a href="/policies/privacy" target="_blank" rel="noopener noreferrer">Data Privacy</a>
                    </Typography>
                  }
                />
                {formik.touched.agreePrivacy && formik.errors.agreePrivacy && (
                  <FormHelperText error>{formik.errors.agreePrivacy as string}</FormHelperText>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formik.values.agreeVendorPolicy}
                      onChange={(e) => formik.setFieldValue('agreeVendorPolicy', e.target.checked)}
                      name="agreeVendorPolicy"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the <a href="/policies/vendor-policy" target="_blank" rel="noopener noreferrer">Vendor Policy</a>
                    </Typography>
                  }
                />
                {formik.touched.agreeVendorPolicy && formik.errors.agreeVendorPolicy && (
                  <FormHelperText error>{formik.errors.agreeVendorPolicy as string}</FormHelperText>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formik.values.agreeVendorPrivacy}
                      onChange={(e) => formik.setFieldValue('agreeVendorPrivacy', e.target.checked)}
                      name="agreeVendorPrivacy"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the <a href="/policies/vendor-privacy" target="_blank" rel="noopener noreferrer">Vendor Privacy Policy</a>
                    </Typography>
                  }
                />
                {formik.touched.agreeVendorPrivacy && formik.errors.agreeVendorPrivacy && (
                  <FormHelperText error>{formik.errors.agreeVendorPrivacy as string}</FormHelperText>
                )}
              </Box>

              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? <CircularProgress size={18} /> : 'Submit'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>

        {/* Right: image (50%) */}
        <Box sx={{ flex: 1, position: 'relative', minHeight: { xs: 240, md: 480 }, borderRadius: 1, overflow: 'hidden' }}>
          <img
            src="https://images.pexels.com/photos/34530202/pexels-photo-34530202.jpeg"
            alt="Vendor registration"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default VendorRegistrationForm
