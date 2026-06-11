import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

interface KategoriStat {
  Aktif: number;
  Ditarik: number;
  Mutasi: number;
  Lulus: number;
  'Tidak Lulus': number;
}

interface ChartData {
  tahun_ajaran_id: number;
  nama_tahun_ajaran: string;
  is_active: boolean;
  kategori: KategoriStat;
}

interface PenugasanChartProps {
  data: ChartData[];
}

const PenugasanChart: React.FC<PenugasanChartProps> = ({ data = [] }) => {
  const [selectedTaId, setSelectedTaId] = useState<string>('');

  useEffect(() => {
    if (data.length > 0 && !selectedTaId) {
      const activeTa = data.find(d => d.is_active);
      setSelectedTaId(activeTa ? activeTa.tahun_ajaran_id.toString() : data[0].tahun_ajaran_id.toString());
    }
  }, [data]);

  const selectedData = data.find(d => d.tahun_ajaran_id.toString() === selectedTaId);

  let chartItems: { label: string; value: number; color: string }[] = [];
  
  if (selectedData) {
    const isTahunAktif = selectedData.is_active;
    const k = selectedData.kategori;

    if (isTahunAktif) {
      chartItems = [
        { label: 'Aktif', value: k.Aktif || 0, color: 'from-blue-500 to-blue-400' },
        { label: 'Mutasi', value: k.Mutasi || 0, color: 'from-amber-500 to-amber-400' },
        { label: 'Ditarik', value: k.Ditarik || 0, color: 'from-red-500 to-red-400' },
      ];
    } else {
      chartItems = [
        { label: 'Lulus', value: k.Lulus || 0, color: 'from-emerald-500 to-emerald-400' },
        { label: 'Tidak Lulus', value: k['Tidak Lulus'] || 0, color: 'from-rose-500 to-rose-400' },
        { label: 'Mutasi', value: k.Mutasi || 0, color: 'from-amber-500 to-amber-400' },
        { label: 'Ditarik', value: k.Ditarik || 0, color: 'from-red-500 to-red-400' },
      ];
    }
  }

  const maxTotal = chartItems.length > 0 ? Math.max(...chartItems.map(d => d.value)) : 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
            <BarChart3 size={24} />
          </div>
          <div className="whitespace-nowrap">
            <h3 className="m-0 text-lg font-bold text-slate-800">Statistik Penugasan</h3>
            <p className="m-0 text-sm text-slate-500">Berdasarkan Kategori Status</p>
          </div>
        </div>

        {data.length > 0 && (
          <select 
            value={selectedTaId}
            onChange={(e) => setSelectedTaId(e.target.value)}
            className="rounded-full px-4 py-2 border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#008FD7]/10 focus:border-[#008FD7] transition-all cursor-pointer min-w-[160px] w-full sm:w-auto"
          >
            {data.map(ta => (
              <option key={ta.tahun_ajaran_id} value={ta.tahun_ajaran_id}>
                TA {ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 flex items-end justify-center gap-8 sm:gap-12 md:gap-16 mt-auto pt-6 min-h-[240px] relative">
        {!selectedData ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            Belum ada data statistik
          </div>
        ) : (
          chartItems.map((item, index) => {
            const heightPercent = maxTotal > 0 ? (item.value / maxTotal) * 100 : 0;
            return (
              <div key={index} className="flex flex-col items-center group w-12 sm:w-16">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-slate-800 text-white text-xs py-1 px-2 rounded font-medium whitespace-nowrap pointer-events-none z-10 relative top-2">
                  {item.value} Santri
                </div>
                
                {/* Bar */}
                <div 
                  className={`w-full bg-gradient-to-t ${item.color} rounded-t-md transition-all duration-500 relative overflow-hidden group-hover:brightness-110 shadow-sm`}
                  style={{ height: `${Math.max(heightPercent, 2)}%`, minHeight: '12px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                {/* Label */}
                <div className="mt-3 text-xs font-semibold text-slate-600 truncate w-full text-center" title={item.label}>
                  {item.label}
                </div>
              </div>
            );
          })
        )}
        
        {/* Background grid lines */}
        <div className="absolute inset-x-0 bottom-0 top-6 -z-10 flex flex-col justify-between pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full border-b border-dashed border-slate-200 h-0"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PenugasanChart;
