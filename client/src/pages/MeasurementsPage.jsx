import React, { useState, useEffect } from 'react';
import {
  Ruler,
  Plus,
  Trash2,
  Calendar,
  Scale,
  TrendingDown,
  TrendingUp,
  X,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import API from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const MeasurementsPage = () => {
  const [measurements, setMeasurements] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State (Explicitly omitting body-fat %)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: '',
    chestCm: '',
    armsCm: '',
    waistCm: '',
    thighsCm: '',
    calvesCm: '',
    shouldersCm: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const res = await API.get('/measurements');
      if (res.data?.success) {
        setMeasurements(res.data.data);
        setChartData(res.data.chartData);
      }
    } catch (err) {
      console.error('Failed to load measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.weightKg) {
      setErrorMsg('Body weight is required.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await API.post('/measurements', formData);
      if (res.data?.success) {
        setShowAddModal(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          weightKg: '',
          chestCm: '',
          armsCm: '',
          waistCm: '',
          thighsCm: '',
          calvesCm: '',
          shouldersCm: '',
          notes: '',
        });
        fetchMeasurements();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save measurement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this measurement log?')) return;
    try {
      await API.delete(`/measurements/${id}`);
      fetchMeasurements();
    } catch (e) {}
  };

  const latest = measurements[0];
  const previous = measurements[1];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
            Body Measurements
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Track skeletal muscle growth and waist circumference without uncalibrated metrics.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-repx-volt text-black font-black font-display text-sm hover:bg-repx-voltHover transition-all shadow-volt-glow active:scale-95"
        >
          <Plus className="w-4 h-4" /> Log Measurement
        </button>
      </div>

      {/* Latest Metrics Cards */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Weight', val: `${latest.weightKg} kg`, highlight: true },
            { label: 'Chest', val: latest.chestCm ? `${latest.chestCm} cm` : '—' },
            { label: 'Arms', val: latest.armsCm ? `${latest.armsCm} cm` : '—' },
            { label: 'Waist', val: latest.waistCm ? `${latest.waistCm} cm` : '—' },
            { label: 'Thighs', val: latest.thighsCm ? `${latest.thighsCm} cm` : '—' },
            { label: 'Calves', val: latest.calvesCm ? `${latest.calvesCm} cm` : '—' },
            { label: 'Shoulders', val: latest.shouldersCm ? `${latest.shouldersCm} cm` : '—' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`repx-card rounded-2xl p-3.5 border ${
                item.highlight
                  ? 'border-repx-volt/40 bg-repx-volt/[0.03]'
                  : 'border-repx-border bg-repx-900'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {item.label}
              </div>
              <div
                className={`text-base font-black font-display mt-0.5 ${
                  item.highlight ? 'text-repx-volt' : 'text-white'
                }`}
              >
                {item.val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Measurements Progression Chart */}
      <div className="repx-card rounded-3xl p-6 md:p-8 border border-repx-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black font-display text-white">
              Circumference & Mass Progression Curves
            </h3>
            <p className="text-xs text-slate-400">Centimeters and Kilograms over time</p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-repx-volt">
              <span className="w-2.5 h-2.5 rounded-full bg-repx-volt"></span> Weight
            </span>
            <span className="flex items-center gap-1.5 text-repx-cyan">
              <span className="w-2.5 h-2.5 rounded-full bg-repx-cyan"></span> Chest
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Arms
            </span>
            <span className="flex items-center gap-1.5 text-repx-crimson">
              <span className="w-2.5 h-2.5 rounded-full bg-repx-crimson"></span> Waist
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B212F" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  domain={['dataMin - 5', 'dataMax + 5']}
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1117',
                    borderColor: '#232938',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#D4FF00"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="chest"
                  name="Chest (cm)"
                  stroke="#00F0FF"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="arms"
                  name="Arms (cm)"
                  stroke="#FBBF24"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="waist"
                  name="Waist (cm)"
                  stroke="#FF2E5B"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No measurement history logged yet.
            </div>
          )}
        </div>
      </div>

      {/* Measurement History Table */}
      <div className="repx-card rounded-3xl p-6 border border-repx-border space-y-4">
        <h3 className="text-lg font-black font-display text-white">Measurement Log Archive</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider text-[10px] border-b border-repx-border">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Weight</th>
                <th className="py-2.5">Chest</th>
                <th className="py-2.5">Arms</th>
                <th className="py-2.5">Waist</th>
                <th className="py-2.5">Thighs</th>
                <th className="py-2.5">Calves</th>
                <th className="py-2.5">Shoulders</th>
                <th className="py-2.5">Notes</th>
                <th className="py-2.5 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-repx-border/40">
              {measurements.map((m) => (
                <tr key={m._id} className="hover:bg-repx-850/50 transition-colors">
                  <td className="py-3 font-semibold text-white">
                    {new Date(m.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 font-black text-repx-volt font-display">{m.weightKg} kg</td>
                  <td className="py-3 text-slate-300">{m.chestCm ? `${m.chestCm} cm` : '—'}</td>
                  <td className="py-3 text-slate-300">{m.armsCm ? `${m.armsCm} cm` : '—'}</td>
                  <td className="py-3 text-slate-300">{m.waistCm ? `${m.waistCm} cm` : '—'}</td>
                  <td className="py-3 text-slate-300">{m.thighsCm ? `${m.thighsCm} cm` : '—'}</td>
                  <td className="py-3 text-slate-300">{m.calvesCm ? `${m.calvesCm} cm` : '—'}</td>
                  <td className="py-3 text-slate-300">{m.shouldersCm ? `${m.shouldersCm} cm` : '—'}</td>
                  <td className="py-3 text-slate-400 italic max-w-xs truncate">{m.notes || '—'}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-slate-600 hover:text-repx-crimson p-1 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD MEASUREMENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="repx-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-repx-border shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-repx-border mb-4">
              <h3 className="text-lg font-black font-display text-white">Record Measurement</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-repx-crimson/15 border border-repx-crimson/40 text-repx-crimson text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Body Weight (KG) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleInputChange}
                    placeholder="e.g. 78.5"
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white font-bold text-repx-volt focus:outline-none focus:border-repx-volt"
                  />
                </div>
              </div>

              {/* Circumferences Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Chest (CM)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="chestCm"
                    value={formData.chestCm}
                    onChange={handleInputChange}
                    placeholder="104"
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Arms (CM)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="armsCm"
                    value={formData.armsCm}
                    onChange={handleInputChange}
                    placeholder="38"
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Waist (CM)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="waistCm"
                    value={formData.waistCm}
                    onChange={handleInputChange}
                    placeholder="84"
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Thighs (CM)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="thighsCm"
                    value={formData.thighsCm}
                    onChange={handleInputChange}
                    placeholder="62"
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Calves (CM)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="calvesCm"
                    value={formData.calvesCm}
                    onChange={handleInputChange}
                    placeholder="38"
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Shoulders (CM)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="shouldersCm"
                    value={formData.shouldersCm}
                    onChange={handleInputChange}
                    placeholder="124"
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Notes</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Morning weigh-in, fasted state..."
                  className="w-full bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-repx-850 hover:bg-repx-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover transition-all shadow-volt-glow active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Weigh-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementsPage;
