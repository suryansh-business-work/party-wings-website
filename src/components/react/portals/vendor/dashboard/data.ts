export interface Order {
  id: string
  customer: string
  total: number
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Processing'
  timestamp: number // Unix timestamp
  items: number
  paymentMethod: string
}

// Generate orders for the last 12 months
const generateOrders = (): Order[] => {
  const orders: Order[] = []
  const now = Date.now()
  const oneYear = 365 * 24 * 60 * 60 * 1000
  const startDate = now - oneYear

  const customers = [
    'Asha Patel', 'Rahul Kumar', 'Neha Singh', 'Amit Sharma', 'Priya Verma',
    'Ravi Singh', 'Sneha Reddy', 'Vikram Mehta', 'Anjali Gupta', 'Karan Joshi',
    'Pooja Nair', 'Arjun Iyer', 'Deepika Rao', 'Sanjay Kapoor', 'Kavita Desai',
    'Rohit Malhotra', 'Simran Kaur', 'Aditya Sharma', 'Meera Pillai', 'Naveen Kumar'
  ]

  const statuses: Order['status'][] = ['Completed', 'Completed', 'Completed', 'Pending', 'Processing', 'Cancelled']
  const paymentMethods = ['UPI', 'Card', 'Cash on Delivery', 'Net Banking']

  let orderId = 1000

  // Generate 80-100 orders spread across the year
  for (let i = 0; i < 95; i++) {
    const randomDate = startDate + Math.random() * oneYear
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    orders.push({
      id: `ORD-${orderId++}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      total: Math.floor(Math.random() * 8000) + 1000, // ₹1000 - ₹9000
      status,
      timestamp: randomDate,
      items: Math.floor(Math.random() * 5) + 1, // 1-5 items
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    })
  }

  // Sort by timestamp descending (newest first)
  return orders.sort((a, b) => b.timestamp - a.timestamp)
}

export const vendorOrders = generateOrders()

// Helper functions for filtering
export const filterOrdersByDateRange = (
  orders: Order[],
  startDate: number,
  endDate: number
): Order[] => {
  return orders.filter(order => order.timestamp >= startDate && order.timestamp <= endDate)
}

export const getDateRange = (filterType: string): { start: number; end: number } => {
  const now = Date.now()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (filterType) {
    case 'today':
      return {
        start: today.getTime(),
        end: now
      }
    case 'last7days':
      return {
        start: now - 7 * 24 * 60 * 60 * 1000,
        end: now
      }
    case 'lastMonth':
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      lastMonth.setDate(1)
      lastMonth.setHours(0, 0, 0, 0)
      const lastMonthEnd = new Date()
      lastMonthEnd.setDate(0)
      lastMonthEnd.setHours(23, 59, 59, 999)
      return {
        start: lastMonth.getTime(),
        end: lastMonthEnd.getTime()
      }
    case 'thisMonth':
      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)
      thisMonthStart.setHours(0, 0, 0, 0)
      return {
        start: thisMonthStart.getTime(),
        end: now
      }
    case 'thisYear':
      const yearStart = new Date()
      yearStart.setMonth(0, 1)
      yearStart.setHours(0, 0, 0, 0)
      return {
        start: yearStart.getTime(),
        end: now
      }
    default: // 'all'
      return {
        start: 0,
        end: now
      }
  }
}

// Generate monthly data for charts
export const getMonthlyData = (orders: Order[]) => {
  const monthlyStats: { [key: string]: { earnings: number; count: number } } = {}
  
  orders.forEach(order => {
    if (order.status === 'Completed') {
      const date = new Date(order.timestamp)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { earnings: 0, count: 0 }
      }
      
      monthlyStats[monthKey].earnings += order.total
      monthlyStats[monthKey].count += 1
    }
  })

  // Get last 12 months
  const result = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    
    result.push({
      month: monthName,
      earnings: monthlyStats[monthKey]?.earnings || 0,
      count: monthlyStats[monthKey]?.count || 0
    })
  }
  
  return result
}
