import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import BusinessIcon from '@mui/icons-material/Business'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import ListItemText from '@mui/material/ListItemText'
import OutlinedInput from '@mui/material/OutlinedInput'
import Chip from '@mui/material/Chip'

import { sendSms } from '../../../utils/sendSms'
import { sendEmail } from '../../../utils/sendEmail'

type Values = {
  businessName: string
  phone: string
  email: string
  businesses?: string[]
  agreeTerms?: boolean
  agreePrivacy?: boolean
  agreeVendorPolicy?: boolean
  agreeVendorPrivacy?: boolean
}

const validationSchema = Yup.object({
  businessName: Yup.string().required('Business name is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9()+\-\s]{7,15}$/, 'Enter a valid phone number'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  businesses: Yup.array().of(Yup.string()),
  agreeTerms: Yup.boolean().oneOf([true], 'You must accept Terms & Conditions'),
  agreePrivacy: Yup.boolean().oneOf([true], 'You must accept Data Privacy'),
  agreeVendorPolicy: Yup.boolean().oneOf([true], 'You must accept Vendor Policy'),
  agreeVendorPrivacy: Yup.boolean().oneOf([true], 'You must accept Vendor Privacy Policy'),
})

const BUSINESS_OPTIONS: { id: string; name: string }[] = [
  { id: 'decoration', name: 'Decoration Service' },
  { id: 'catering', name: 'Catering Service' },
  { id: 'photography', name: 'Photography Service' },
  { id: 'makeup', name: 'Mekup & Gromming' },
  { id: 'party-supplies', name: 'I run a party supplies business.' },
  { id: 'other', name: 'Other Party Services' },
]

const VendorRegistrationForm: React.FC = () => {
  const [smsSentCode, setSmsSentCode] = useState<string | null>(null)
  const [emailSentCode, setEmailSentCode] = useState<string | null>(null)
  const [smsVerified, setSmsVerified] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [sendingSms, setSendingSms] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [verifyingSms, setVerifyingSms] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [smsVerifyInput, setSmsVerifyInput] = useState('')
  const [emailVerifyInput, setEmailVerifyInput] = useState('')

  const formik = useFormik<Values>({
  initialValues: { businessName: '', phone: '', email: '', businesses: [], agreeTerms: false, agreePrivacy: false, agreeVendorPolicy: false, agreeVendorPrivacy: false },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      // final submit: only allowed if both verified
      if (!smsVerified || !emailVerified) {
        alert('Please verify both phone and email before submitting.')
        setSubmitting(false)
        return
      }

      // TODO: integrate real submit endpoint — for now, just log
      console.log('Submitting vendor registration', values)
      alert('Submitted successfully')
      setSubmitting(false)
    },
  })

  const handleSendSms = async () => {
    if (!formik.values.phone || formik.errors.phone) {
      formik.setFieldTouched('phone', true)
      formik.setFieldError('phone', formik.errors.phone || 'Enter a valid phone')
      return
    }
    try {
      setSendingSms(true)
      // Call provided util which returns a code (utils currently returns 123456)
      const code = await sendSms(formik.values.phone, 'Verification code', 'Your verification code')
      // normalise to string
      setSmsSentCode(String(code))
      setSmsVerified(false)
      alert('Verification SMS sent')
    } catch (err) {
      console.error(err)
      alert('Failed to send SMS')
    } finally {
      setSendingSms(false)
    }
  }

  const handleSendEmail = async () => {
    if (!formik.values.email || formik.errors.email) {
      formik.setFieldTouched('email', true)
      formik.setFieldError('email', formik.errors.email || 'Enter a valid email')
      return
    }
    try {
      setSendingEmail(true)
      const code = await sendEmail(formik.values.email, 'Verification code', 'Your verification code')
      setEmailSentCode(String(code))
      setEmailVerified(false)
      alert('Verification Email sent')
    } catch (err) {
      console.error(err)
      alert('Failed to send Email')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleVerifySms = async () => {
    if (!smsSentCode) {
      alert('Send SMS first')
      return
    }
    setVerifyingSms(true)
    // In a real app you'd verify server-side. Here we compare to the sent code.
    setTimeout(() => {
      if (smsVerifyInput === smsSentCode) {
        setSmsVerified(true)
        alert('Phone verified')
      } else {
        alert('Incorrect SMS code')
      }
      setVerifyingSms(false)
    }, 500)
  }

  const handleVerifyEmail = async () => {
    if (!emailSentCode) {
      alert('Send Email first')
      return
    }
    setVerifyingEmail(true)
    setTimeout(() => {
      if (emailVerifyInput === emailSentCode) {
        setEmailVerified(true)
        alert('Email verified')
      } else {
        alert('Incorrect Email code')
      }
      setVerifyingEmail(false)
    }, 500)
  }

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

              {/* Multi-select: Which business(es) are you in */}
              <FormControl fullWidth>
                <InputLabel id="businesses-label">You are in which business</InputLabel>
                <Select
                  labelId="businesses-label"
                  id="businesses"
                  multiple
                  value={formik.values.businesses || []}
                  onChange={(e) => formik.setFieldValue('businesses', e.target.value)}
                  input={<OutlinedInput label="You are in which business" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((id) => {
                        const opt = BUSINESS_OPTIONS.find((o) => o.id === id)
                        return <Chip key={id} label={opt ? opt.name : id} size="small" />
                      })}
                    </Box>
                  )}
                >
                  {BUSINESS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id}>
                      <Checkbox checked={(formik.values.businesses || []).indexOf(opt.id) > -1} />
                      <ListItemText primary={opt.name} />
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary">
                  Select one or more services that best describe your business
                </Typography>
              </FormControl>

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
                      {smsVerified ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <Button
                          onClick={handleSendSms}
                          size="small"
                          variant="outlined"
                          endIcon={sendingSms ? <CircularProgress size={16} /> : <SendIcon />}
                        >
                          Send SMS
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                }}
              />

              {smsSentCode && !smsVerified && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="SMS code"
                    value={smsVerifyInput}
                    onChange={(e) => setSmsVerifyInput(e.target.value)}
                    size="small"
                  />
                  <Button onClick={handleVerifySms} variant="contained" disabled={verifyingSms} startIcon={<SendIcon />}>
                    {verifyingSms ? <CircularProgress size={18} /> : 'Verify SMS'}
                  </Button>
                </Stack>
              )}

              <TextField
                id="email"
                name="email"
                label="Email"
                helperText={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : 'Your registered Business email'
                }
                error={formik.touched.email && Boolean(formik.errors.email)}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {emailVerified ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <Button
                          onClick={handleSendEmail}
                          size="small"
                          variant="outlined"
                          endIcon={sendingEmail ? <CircularProgress size={16} /> : <SendIcon />}
                        >
                          Send Email
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                }}
              />

              {emailSentCode && !emailVerified && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="Email code"
                    value={emailVerifyInput}
                    onChange={(e) => setEmailVerifyInput(e.target.value)}
                    size="small"
                  />
                  <Button onClick={handleVerifyEmail} variant="contained" disabled={verifyingEmail} startIcon={<SendIcon />}>
                    {verifyingEmail ? <CircularProgress size={18} /> : 'Verify Email'}
                  </Button>
                </Stack>
              )}

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
                  disabled={
                    !smsVerified || !emailVerified || !formik.values.agreeTerms || !formik.values.agreePrivacy || !formik.values.agreeVendorPolicy || !formik.values.agreeVendorPrivacy || formik.isSubmitting
                  }
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
