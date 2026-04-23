import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Loader2 } from 'lucide-react';
import { fetchTradingData } from '../api/carbonApi';

const orderBook = {
  buy: [
    { price: 15.2, credits: 1500, total: 22800 },
    { price: 15.1, credits: 2300, total: 34730 },
    { price: 15.0, credits: 1800, total: 27000 },
    { price: 14.9, credits: 3200, total: 47680 },
  ],
  sell: [
    { price: 15.3, credits: 1200, total: 18360 },
    { price: 15.4, credits: 1900, total: 29260 },
    { price: 15.5, credits: 2100, total: 32550 },
    { price: 15.6, credits: 1600, total: 24960 },
  ],
};


export function TradingDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchTradingData();
        setData(result);
      } catch (error) {
        console.error("Failed to load trading data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Generate a mock volume array based on the 24h volume for the chart
  const weeklyVolume = [
    { name: 'Mon', volume: Math.floor(data.volume24h * 0.1) },
    { name: 'Tue', volume: Math.floor(data.volume24h * 0.12) },
    { name: 'Wed', volume: Math.floor(data.volume24h * 0.15) },
    { name: 'Thu', volume: Math.floor(data.volume24h * 0.14) },
    { name: 'Fri', volume: Math.floor(data.volume24h * 0.18) },
    { name: 'Sat', volume: Math.floor(data.volume24h * 0.11) },
    { name: 'Sun', volume: Math.floor(data.volume24h * 0.2) },
  ];

  return (
    <div className="space-y-4">
      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Current Price</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="mb-1">${data.currentPrice}</h3>
          <div className="flex items-center gap-1 text-sm text-green-500">
            <ArrowUpRight className="w-3 h-3" />
            <span>+2.4%</span>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">24h Volume</p>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <h3 className="mb-1">{data.volume24h.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">Credits traded</p>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">24h High</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="mb-1">${(parseFloat(data.currentPrice) + 0.35).toFixed(2)}</h3>
          <p className="text-sm text-muted-foreground">Peak price</p>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">24h Low</p>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="mb-1">${(parseFloat(data.currentPrice) - 1.2).toFixed(2)}</h3>
          <p className="text-sm text-muted-foreground">Lowest price</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Price Chart */}
        <div className="lg:col-span-2 bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3>Price Chart</h3>
            <div className="flex gap-2">
              {['1H', '1D', '1W', '1M', 'ALL'].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 text-sm rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.priceData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d8659" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2d8659" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 134, 89, 0.1)" />
              <XAxis dataKey="time" stroke="#5a7d68" style={{ fontSize: '12px' }} />
              <YAxis stroke="#5a7d68" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(45, 134, 89, 0.2)',
                  borderRadius: '12px',
                  padding: '8px 12px'
                }}
              />
              <Area type="monotone" dataKey="price" stroke="#2d8659" strokeWidth={2} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Market Share Pie Chart */}
        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="mb-4">Credit Types Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.marketShareData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.marketShareData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.marketShareData.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Volume Chart and Order Book */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Volume Chart */}
        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="mb-4">Trading Volume (7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 134, 89, 0.1)" />
              <XAxis dataKey="name" stroke="#5a7d68" style={{ fontSize: '12px' }} />
              <YAxis stroke="#5a7d68" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(45, 134, 89, 0.2)',
                  borderRadius: '12px',
                  padding: '8px 12px'
                }}
              />
              <Bar dataKey="volume" fill="#2d8659" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Book */}
        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="mb-4">Order Book</h3>
          <div className="space-y-4">
            {/* Sell Orders */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">SELL ORDERS</p>
              <div className="space-y-1">
                {orderBook.sell.map((order, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 bg-red-500/5 rounded-lg">
                    <span className="text-red-600">${order.price}</span>
                    <span className="text-muted-foreground">{order.credits}</span>
                    <span className="text-muted-foreground">${order.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Price */}
            <div className="py-2 border-y border-border">
              <p className="text-center">
                <span className="text-sm text-muted-foreground mr-2">Last Price:</span>
                <span className="text-primary">${data.currentPrice}</span>
              </p>
            </div>

            {/* Buy Orders */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">BUY ORDERS</p>
              <div className="space-y-1">
                {orderBook.buy.map((order, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 bg-green-500/5 rounded-lg">
                    <span className="text-green-600">${order.price}</span>
                    <span className="text-muted-foreground">{order.credits}</span>
                    <span className="text-muted-foreground">${order.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Time</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Buyer</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Seller</th>
                <th className="text-right py-3 px-4 text-sm text-muted-foreground">Credits</th>
                <th className="text-right py-3 px-4 text-sm text-muted-foreground">Price</th>
                <th className="text-right py-3 px-4 text-sm text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTrades.map((trade: any) => (
                <tr key={trade.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4 text-sm">{trade.time}</td>
                  <td className="py-3 px-4 text-sm">{trade.buyer}</td>
                  <td className="py-3 px-4 text-sm">{trade.seller}</td>
                  <td className="py-3 px-4 text-sm text-right">{trade.credits}</td>
                  <td className="py-3 px-4 text-sm text-right text-primary">${trade.price}</td>
                  <td className="py-3 px-4 text-sm text-right">${(trade.credits * trade.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
