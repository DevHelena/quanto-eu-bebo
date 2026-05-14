import React, { useState, useMemo } from 'react';
import { 
  Beer, 
  TrendingUp, 
  DollarSign, 
  PlusCircle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

function App() {
  const [consumptions, setConsumptions] = useState([]);
  const [formData, setFormData] = useState({
    brand: '',
    volume: '',
    unit: 'ml',
    price: ''
  });

  const COLORS = ['#f59e0b', '#38bdf8', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.volume || !formData.price) return;

    const volumeNum = parseFloat(formData.volume);
    const volumeInLiters = formData.unit === 'ml' ? volumeNum / 1000 : volumeNum;

    const newConsumption = {
      id: Date.now(),
      date: new Date().toISOString(),
      brand: formData.brand.trim(),
      volume: volumeNum,
      unit: formData.unit,
      liters: volumeInLiters,
      price: parseFloat(formData.price)
    };

    setConsumptions(prev => [newConsumption, ...prev]);
    setFormData({ brand: '', volume: '', unit: 'ml', price: '' });
  };

  // Metrics Calculation
  const totalLiters = useMemo(() => {
    return consumptions.reduce((acc, curr) => acc + curr.liters, 0).toFixed(2);
  }, [consumptions]);

  const totalExpenses = useMemo(() => {
    return consumptions.reduce((acc, curr) => acc + curr.price, 0).toFixed(2);
  }, [consumptions]);

  const brandStats = useMemo(() => {
    const stats = {};
    consumptions.forEach(c => {
      if (!stats[c.brand]) {
        stats[c.brand] = { liters: 0, expenses: 0, count: 0 };
      }
      stats[c.brand].liters += c.liters;
      stats[c.brand].expenses += c.price;
      stats[c.brand].count += 1;
    });
    return stats;
  }, [consumptions]);

  const topBrand = useMemo(() => {
    if (Object.keys(brandStats).length === 0) return 'Nenhuma';
    return Object.keys(brandStats).reduce((a, b) => brandStats[a].liters > brandStats[b].liters ? a : b);
  }, [brandStats]);

  // Chart Data Preparation
  const litersByBrandData = useMemo(() => {
    return Object.keys(brandStats).map(brand => ({
      name: brand,
      value: Number(brandStats[brand].liters.toFixed(2))
    }));
  }, [brandStats]);

  const expensesByBrandData = useMemo(() => {
    return Object.keys(brandStats).map(brand => ({
      name: brand,
      value: Number(brandStats[brand].expenses.toFixed(2))
    }));
  }, [brandStats]);

  // For simplicity in a single page, we just group by insertion order or day if needed.
  // Here we'll do consumption over time (last 10 entries reversed to chronological)
  const consumptionOverTime = useMemo(() => {
    return [...consumptions]
      .reverse()
      .map((c, i) => ({
        name: `C${i + 1}`,
        litros: Number(c.liters.toFixed(2)),
        marca: c.brand
      }));
  }, [consumptions]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">BeerTracker PRO</h1>
        <p className="subtitle">Monitore seu consumo de cerveja, gastos e marcas favoritas com elegância.</p>
      </header>

      <div className="dashboard-grid">
        {/* Left Column: Form & History */}
        <div className="left-panel">
          <div className="glass-panel">
            <h2 className="chart-title">
              <PlusCircle size={24} color="#f59e0b" />
              Adicionar Consumo
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Marca da Cerveja</label>
                <input 
                  type="text" 
                  name="brand"
                  className="form-input" 
                  placeholder="Ex: Heineken, Stella Artois..."
                  value={formData.brand}
                  onChange={handleInputChange}
                  list="brands-list"
                  required
                />
                <datalist id="brands-list">
                  <option value="Heineken" />
                  <option value="Stella Artois" />
                  <option value="Budweiser" />
                  <option value="Corona" />
                  <option value="Brahma" />
                  <option value="Skol" />
                  <option value="Amstel" />
                  <option value="Original" />
                  <option value="Colorado" />
                </datalist>
              </div>

              <div className="input-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Volume</label>
                  <input 
                    type="number" 
                    name="volume"
                    className="form-input" 
                    placeholder="Ex: 350"
                    min="1"
                    step="0.01"
                    value={formData.volume}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Unidade</label>
                  <select 
                    name="unit" 
                    className="form-select"
                    value={formData.unit}
                    onChange={handleInputChange}
                  >
                    <option value="ml">ml</option>
                    <option value="l">Litros</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preço (R$)</label>
                <input 
                  type="number" 
                  name="price"
                  className="form-input" 
                  placeholder="Ex: 7.50"
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className="btn-submit">
                Registrar Consumo
              </button>
            </form>
          </div>

          {consumptions.length > 0 && (
            <div className="glass-panel recent-list">
              <h2 className="chart-title">Recentes</h2>
              {consumptions.slice(0, 5).map(c => (
                <div key={c.id} className="recent-item">
                  <div className="recent-item-info">
                    <div className="recent-item-icon">
                      <Beer size={20} />
                    </div>
                    <div>
                      <div className="recent-item-title">{c.brand}</div>
                      <div className="recent-item-date">{new Date(c.date).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div>
                    <div className="recent-item-value">{c.volume} {c.unit}</div>
                    <div className="recent-item-subvalue">{formatCurrency(c.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Metrics & Charts */}
        <div className="right-panel">
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-title">Total Consumido</span>
              <div className="metric-value">{totalLiters} L</div>
            </div>
            <div className="metric-card">
              <span className="metric-title">Gasto Total</span>
              <div className="metric-value">{formatCurrency(totalExpenses)}</div>
            </div>
            <div className="metric-card">
              <span className="metric-title">Marca Favorita</span>
              <div className="metric-value" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{topBrand}</div>
            </div>
          </div>

          {consumptions.length === 0 ? (
            <div className="glass-panel empty-state">
              <Beer size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>Nenhum consumo registrado</h3>
              <p>Adicione sua primeira cerveja para visualizar os gráficos.</p>
            </div>
          ) : (
            <div className="charts-grid">
              <div className="glass-panel">
                <h2 className="chart-title">
                  <BarChart3 size={24} color="#38bdf8" />
                  Evolução do Consumo (L)
                </h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={consumptionOverTime}>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="litros" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel">
                <h2 className="chart-title">
                  <PieChartIcon size={24} color="#ec4899" />
                  Gastos por Marca
                </h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByBrandData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expensesByBrandData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
                <h2 className="chart-title">
                  <TrendingUp size={24} color="#10b981" />
                  Volume por Marca (L)
                </h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={litersByBrandData} layout="vertical">
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                        {litersByBrandData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
