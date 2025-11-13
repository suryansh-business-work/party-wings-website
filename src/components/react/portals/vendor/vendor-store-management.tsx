import React, { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Pagination from '@mui/material/Pagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'

import Header from './components/Header'

type ProductStatus = 'Live' | 'Pending Review' | 'Rejected'

type Product = {
  id: string
  title: string
  price: number
  stock: number
  status: ProductStatus
  createdAt: number
  rejectionReason?: string
  images?: string[]
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: 'P-1001', title: 'Birthday Balloon Set', price: 499, stock: 25, status: 'Live', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40, images: [] },
  { id: 'P-1002', title: 'Party Light String', price: 799, stock: 12, status: 'Pending Review', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, images: [] },
  { id: 'P-1003', title: 'Cake Topper - Sparkle', price: 249, stock: 50, status: 'Rejected', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, rejectionReason: 'Image too small', images: [] },
  { id: 'P-1004', title: 'Table Confetti Pack', price: 199, stock: 80, status: 'Live', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120, images: [] },
]

const PAGE_SIZE = 10

const statusColor = (s: ProductStatus) => {
  switch (s) {
    case 'Live':
      return 'success'
    case 'Pending Review':
      return 'warning'
    case 'Rejected':
      return 'error'
  }
}

const VendorStoreManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS)
  const [query, setQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [selected, setSelected] = useState<Product | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState<{ open: boolean; id?: string }>({ open: false })

  // file input ref not necessary; we'll handle files directly


  // Derived list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => !q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
  }, [products, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  // CRUD handlers
  const handleAdd = () => {
    setSelected({ id: `P-${Math.floor(1000 + Math.random() * 9000)}`, title: '', price: 0, stock: 0, status: 'Pending Review', createdAt: Date.now() })
    setEditOpen(true)
  }

  const handleEdit = (p: Product) => {
    // clone to avoid mutating original until saved
    setSelected({ ...p, images: [...(p.images || [])] })
    setEditOpen(true)
  }

  const handleView = (p: Product) => {
    setSelected({ ...p, images: [...(p.images || [])] })
    setViewOpen(true)
  }

  const handleSave = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.find((x) => x.id === product.id)
      if (exists) return prev.map((x) => (x.id === product.id ? product : x))
      return [product, ...prev]
    })
    setEditOpen(false)
    setSelected(null)
  }

  // handle multiple image selection -> create object URLs for preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !selected) return
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const url = URL.createObjectURL(f)
      urls.push(url)
    }
    // append to selected images
    setSelected({ ...selected, images: [...(selected.images || []), ...urls] })
    // clear input
    e.currentTarget.value = ''
  }

  const handleRemoveImage = (index: number) => {
    if (!selected) return
    const images = [...(selected.images || [])]
    const removed = images.splice(index, 1)
    // revoke object URL if it was created via createObjectURL
    if (removed[0] && removed[0].startsWith('blob:')) URL.revokeObjectURL(removed[0])
    setSelected({ ...selected, images })
  }

  const handleDelete = (id?: string) => {
    if (!id) return setDeleteOpen({ open: false })
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeleteOpen({ open: false })
  }

  const handleReviewRejection = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Pending Review', rejectionReason: undefined } : p)))
  }

  return (
    <Box sx={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Header />
      <Box className="container" sx={{ py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Store Management</Typography>
          <Stack direction="row" spacing={1}>
            <TextField size="small" placeholder="Search product or SKU" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} sx={{ minWidth: 280, bgcolor: 'white' }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add Product</Button>
          </Stack>
        </Stack>

        <Card>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageData.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.title}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>₹{p.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>
                      <Chip label={p.status} color={statusColor(p.status)} size="small" />
                      {p.status === 'Rejected' && (
                        <Button size="small" sx={{ ml: 1 }} onClick={() => handleReviewRejection(p.id)}>Review your rejection</Button>
                      )}
                    </TableCell>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => handleView(p)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEdit(p)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteOpen({ open: true, id: p.id })}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {pageData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No products found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</Typography>
              <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} />
            </Stack>
          </CardContent>
        </Card>

        {/* Edit / Add dialog */}
        <Dialog open={editOpen} onClose={() => { setEditOpen(false); setSelected(null) }} maxWidth="sm" fullWidth>
          <DialogTitle>{selected?.id ? (products.find(p => p.id === selected.id) ? 'Edit Product' : 'Add Product') : 'Product'}</DialogTitle>
          <DialogContent>
                {selected && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField label="SKU" size="small" value={selected.id} disabled />
                <TextField label="Title" size="small" value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })} />
                <TextField label="Price" size="small" type="number" value={selected.price} onChange={(e) => setSelected({ ...selected, price: Number(e.target.value) })} />
                <TextField label="Stock" size="small" type="number" value={selected.stock} onChange={(e) => setSelected({ ...selected, stock: Number(e.target.value) })} />
                <FormControl size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={selected.status} label="Status" onChange={(e) => setSelected({ ...selected, status: e.target.value as ProductStatus })}>
                    <MenuItem value="Live">Live</MenuItem>
                    <MenuItem value="Pending Review">Pending Review</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
                {selected.status === 'Rejected' && (
                  <TextField label="Rejection Reason" size="small" value={selected.rejectionReason || ''} onChange={(e) => setSelected({ ...selected, rejectionReason: e.target.value })} />
                )}

                {/* Image upload & previews */}
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Product Images</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, mb: 1, flexWrap: 'wrap' }}>
                    {(selected.images || []).map((src, idx) => (
                      <Box key={idx} sx={{ position: 'relative' }}>
                        <img src={src} alt={`img-${idx}`} style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                        <IconButton size="small" onClick={() => handleRemoveImage(idx)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button variant="outlined" component="label" size="small">
                      Upload
                      <input hidden accept="image/*" multiple type="file" onChange={handleFileSelect} />
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setEditOpen(false); setSelected(null) }}>Cancel</Button>
            <Button onClick={() => selected && handleSave(selected)} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* View dialog */}
        <Dialog open={viewOpen} onClose={() => { setViewOpen(false); setSelected(null) }} maxWidth="sm" fullWidth>
          <DialogTitle>Product Details</DialogTitle>
          <DialogContent>
            {selected && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Typography variant="subtitle2">SKU</Typography>
                <Typography>{selected.id}</Typography>
                <Typography variant="subtitle2">Title</Typography>
                <Typography>{selected.title}</Typography>
                <Typography variant="subtitle2">Price</Typography>
                <Typography>₹{selected.price.toLocaleString('en-IN')}</Typography>
                <Typography variant="subtitle2">Stock</Typography>
                <Typography>{selected.stock}</Typography>
                <Typography variant="subtitle2">Status</Typography>
                <Chip label={selected.status} color={statusColor(selected.status)} />
                {selected.status === 'Rejected' && (
                  <>
                    <Typography variant="subtitle2">Rejection Reason</Typography>
                    <Typography>{selected.rejectionReason}</Typography>
                  </>
                )}

                {/* display images if any */}
                {(selected.images || []).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">Images</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                      {(selected.images || []).map((src, idx) => (
                        <img key={idx} src={src} alt={`img-${idx}`} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setViewOpen(false); setSelected(null) }}>Close</Button>
            {selected && selected.status === 'Rejected' && (
              <Button onClick={() => { handleReviewRejection(selected.id); setViewOpen(false) }} variant="contained">Review your rejection</Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={deleteOpen.open} onClose={() => setDeleteOpen({ open: false })}>
          <DialogTitle>Delete product</DialogTitle>
          <DialogContent>Are you sure you want to delete this product?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen({ open: false })}>Cancel</Button>
            <Button onClick={() => handleDelete(deleteOpen.id)} variant="contained" color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}

export default VendorStoreManagement
