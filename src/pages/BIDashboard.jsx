import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar, Label
} from 'recharts';
import { 
  RefreshCw, TrendingUp, Users, Activity, CalendarX, 
  CheckCircle, Clock, AlertCircle, PieChart as PieIcon,
  Map, UserMinus, Filter
} from 'lucide-react';

// --- PALETA DE COLORES SEXY ---
const COLORS = {
  primary: ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'],
  status: {
    success: '#10b981', // Emerald
    warning: '#f59e0b', // Amber
    danger: '#ef4444',  // Rose
  }
};

const BIDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [etlLoading, setEtlLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    medico: '',
    especialidad: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/bi/analytics/dashboard/?${queryParams}`;
      const response = await api.get(url);
      setData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunETL = async () => {
    try {
      setEtlLoading(true);
      await api.runETL();
      await fetchData();
    } catch (err) {
      alert("Error al ejecutar el ETL.");
    } finally {
      setEtlLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) return <LoadingState />;
  if (!data) return <ErrorState retry={fetchData} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 font-sans">
      
      {/* === 1. HEADER & FILTROS === */}
      <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-100 border border-slate-100 sticky top-0 z-20 backdrop-blur-xl bg-white/95">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                <Activity size={24} />
              </div>
              Clinical Intelligence
            </h2>
            <p className="text-sm text-slate-500 font-medium ml-14">Análisis estratégico y operativo en tiempo real.</p>
          </div>
          
          <button 
            onClick={handleRunETL}
            disabled={etlLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95
              ${etlLoading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'}`}
          >
            <RefreshCw className={`w-4 h-4 ${etlLoading ? 'animate-spin' : ''}`} />
            {etlLoading ? 'Sincronizando...' : 'Actualizar DataMart'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <FilterInput label="Desde" type="date" value={filters.start_date} onChange={(e) => setFilters({...filters, start_date: e.target.value})} />
          <FilterInput label="Hasta" type="date" value={filters.end_date} onChange={(e) => setFilters({...filters, end_date: e.target.value})} />
          <FilterInput label="Médico" type="text" placeholder="Nombre..." value={filters.medico} onChange={(e) => setFilters({...filters, medico: e.target.value})} />
          <FilterInput label="Especialidad" type="text" placeholder="Ej: Retina..." value={filters.especialidad} onChange={(e) => setFilters({...filters, especialidad: e.target.value})} />
          
          <button 
            onClick={fetchData}
            className="flex-1 min-w-[120px] bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-300 flex justify-center items-center gap-2"
          >
            <Filter className="w-4 h-4" /> Filtrar
          </button>
        </div>
      </div>

      {/* === 2. NAVEGACIÓN TABS === */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        <TabButton id="resumen" label="Resumen Ejecutivo" icon={<TrendingUp size={18}/>} active={activeTab} onClick={setActiveTab} />
        <TabButton id="demografia" label="Demografía" icon={<Users size={18}/>} active={activeTab} onClick={setActiveTab} />
        <TabButton id="operaciones" label="Eficiencia" icon={<Clock size={18}/>} active={activeTab} onClick={setActiveTab} />
        <TabButton id="fugas" label="Fugas & Cancelaciones" icon={<UserMinus size={18}/>} active={activeTab} onClick={setActiveTab} />
      </div>

      {/* === 3. CONTENIDO === */}
      <div className="min-h-[500px]">
        {activeTab === 'resumen' && <ResumenView data={data.resumen} />}
        {activeTab === 'demografia' && <DemografiaView data={data.demografia} />}
        {activeTab === 'operaciones' && <OperacionesView data={data.operaciones} />}
        {activeTab === 'fugas' && <FugasView data={data.fugas} />}
      </div>

    </div>
  );
};

// ==========================================
// VISTAS
// ==========================================

const ResumenView = ({ data }) => {
  if (!data) return <div className="text-red-500">No hay datos para mostrar.</div>;
  // Extraemos todos los datos necesarios
  const { kpis, tendencia, top_medicos } = data;
  
  // Cálculos de dona
  const pendientes = kpis.total_citas - (kpis.realizadas + kpis.canceladas);
  const pieData = [
    { name: 'Realizadas', value: kpis.realizadas },
    { name: 'Canceladas', value: kpis.canceladas },
    { name: 'Pendientes', value: Math.max(0, pendientes) },
  ];
  const STATUS_COLORS = [COLORS.status.success, COLORS.status.danger, COLORS.status.warning];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* FILA 1: TARJETAS DE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard title="Total Citas" value={kpis.total_citas.toLocaleString()} icon={<Users className="text-indigo-600"/>} color="bg-indigo-50" border="border-indigo-100" />
        <KPICard title="Citas Realizadas" value={kpis.realizadas.toLocaleString()} icon={<CheckCircle className="text-emerald-600"/>} color="bg-emerald-50" border="border-emerald-100" />
        <KPICard title="Tasa Cancelación" value={`${kpis.tasa_cancelacion}%`} icon={<CalendarX className="text-rose-600"/>} color="bg-rose-50" border="border-rose-100" negative={kpis.tasa_cancelacion > 20} />
        <KPICard title="Duración Promedio" value={`${kpis.duracion_promedio}m`} icon={<Clock className="text-amber-600"/>} color="bg-amber-50" border="border-amber-100" />
      </div>

      {/* FILA 2: GRÁFICOS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[420px]">
        
        {/* TENDENCIA (ÁREA) */}
        <ChartContainer title="Tendencia Mensual de Citas" colSpan="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tendencia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis 
                dataKey="fecha_cita__nombre_mes" 
                axisLine={false} tickLine={false} 
                tick={{fill:'#64748b', fontSize:12}} 
                dy={10}
                interval={0} // Muestra todos los meses
                tickFormatter={(val) => val ? val.substring(0, 3) : ''} // Recorta a 3 letras
              />
              <YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b', fontSize:12}} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fill="url(#colorTotal)" activeDot={{r: 6, strokeWidth: 0, fill:'#4f46e5'}}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* ESTADO ACTUAL (DONA) */}
        <ChartContainer title="Estado Actual de Citas">
          {/* Contenedor relativo para el texto flotante */}
          <div className="relative h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  innerRadius="65%" 
                  outerRadius="85%" 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 600}}/>
              </PieChart>
            </ResponsiveContainer>
            
            {/* TEXTO CENTRAL CENTRADO CORRECTAMENTE */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[65%] text-center pointer-events-none">
              <p className="text-3xl font-black text-slate-800 tracking-tight">
                {kpis.total_citas.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                TOTAL
              </p>
            </div>
          </div>
        </ChartContainer>
      </div>

      {/* FILA 3: TOP MÉDICOS */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Top Médicos Productivos</h3>
          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">Ranking por volumen</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {top_medicos && top_medicos.length > 0 ? top_medicos.map((m, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-all group cursor-default">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                ${i===0 ? 'bg-yellow-400 text-white ring-4 ring-yellow-100' : 
                  i===1 ? 'bg-slate-300 text-white' : 
                  i===2 ? 'bg-amber-700 text-white' : 'bg-white border text-slate-400'}`}>
                {i+1}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-700 text-sm group-hover:text-indigo-700 transition-colors line-clamp-1">{m.medico__nombre_completo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (m.citas / top_medicos[0].citas) * 100)}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">{m.citas}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center text-slate-400 py-4">No hay datos de médicos disponibles.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const DemografiaView = ({ data }) => {
  const sexoData = data.distribucion_sexo.map(d => ({ name: d.paciente__genero === 'M' ? 'Masculino' : 'Femenino', value: d.total }));
  const edadData = data.distribucion_edad.map(d => ({ name: d.paciente__grupo_etario, value: d.total }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <ChartContainer title="Distribución por Grupo Etario">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={edadData} layout="vertical" margin={{left: 20, right: 20}}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
            <XAxis type="number" hide/>
            <YAxis dataKey="name" type="category" width={100} tick={{fontSize:12, fill: '#64748b', fontWeight: 600}}/>
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0,6,6,0]} barSize={32}>
              {edadData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Distribución por Género">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={sexoData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value" labelLine={false}>
              {sexoData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Masculino' ? '#3b82f6' : '#ec4899'} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend iconType="circle"/>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

const OperacionesView = ({ data }) => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const hours = Array.from({length: 13}, (_, i) => i + 7); 

  const getIntensity = (day, hour) => {
    const item = data.heatmap.find(d => d.fecha_cita__dia_semana === day && d.hora === hour);
    return item ? item.cantidad : 0;
  };
  const maxVal = Math.max(...data.heatmap.map(d => d.cantidad), 1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-x-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-500"/>
          Mapa de Calor: Horas Pico
        </h3>
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[auto_repeat(13,1fr)] gap-1.5">
            <div className="h-8"></div>
            {hours.map(h => <div key={h} className="text-xs text-center text-slate-400 font-bold">{h}:00</div>)}

            {[2,3,4,5,6,7,1].map((dayNum) => (
              <React.Fragment key={dayNum}>
                <div className="text-xs font-bold text-slate-600 flex items-center h-10 pr-3 justify-end">{days[dayNum === 1 ? 0 : dayNum-1]}</div>
                {hours.map(h => {
                  const val = getIntensity(dayNum, h);
                  const opacity = val > 0 ? (val / maxVal) * 0.8 + 0.2 : 0.05; 
                  return (
                    <div 
                      key={`${dayNum}-${h}`} 
                      className="h-10 rounded-lg bg-indigo-600 transition-all hover:scale-110 hover:z-10 relative group cursor-crosshair"
                      style={{ opacity }} 
                    >
                      {val > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg shadow-xl pointer-events-none z-20 whitespace-nowrap font-bold">
                          {val} citas
                        </div>
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <ChartContainer title="Duración Promedio por Especialidad (min)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.duracion_por_especialidad} margin={{top: 20}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
            <XAxis dataKey="especialidad__nombre_especialidad" tick={{fontSize:11, fill: '#64748b', fontWeight: 600}} interval={0} />
            <YAxis tick={{fontSize:12, fill: '#64748b'}}/>
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="promedio_min" radius={[6,6,0,0]} barSize={40}>
               {data.duracion_por_especialidad.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.status.warning : '#fbbf24'} />
               ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

const FugasView = ({ data }) => {
  // Colores vibrantes para distinguir las fugas
  const FUGAS_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <ChartContainer title="Motivos de Cancelación">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart layout="vertical" data={data.por_motivo} margin={{left: 20, right: 40, top: 20, bottom: 20}}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
            <XAxis type="number" hide/>
            <YAxis 
              dataKey="estado__descripcion_estado" 
              type="category" 
              width={100} 
              tick={{fontSize:12, fontWeight:600, fill:'#64748b'}} 
              axisLine={false} 
              tickLine={false}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="total" radius={[0,8,8,0]} barSize={32} background={{fill: '#fef2f2', radius:[0,8,8,0]}}>
              {data.por_motivo.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ef4444' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Fugas por Especialidad">
        <div className="flex h-[350px] items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{top: 0, bottom: 0}}>
              <Pie 
                data={data.por_especialidad} 
                innerRadius={70} 
                outerRadius={100} 
                dataKey="total" 
                nameKey="especialidad__nombre_especialidad" 
                paddingAngle={4} 
                stroke="none"
              >
                {data.por_especialidad.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FUGAS_COLORS[index % FUGAS_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  paddingLeft: '20px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#475569',
                  maxWidth: '40%'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
};

// ==========================================
// COMPONENTES UI
// ==========================================

const ChartContainer = ({ title, children, colSpan = "" }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ${colSpan}`}>
    <h3 className="text-lg font-bold text-slate-800 mb-6">{title}</h3>
    <div className="h-[300px] w-full">{children}</div>
  </div>
);

const FilterInput = ({ label, ...props }) => (
  <div className="flex-1 min-w-[140px] space-y-1.5">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <input className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" {...props} />
  </div>
);

const TabButton = ({ id, label, icon, active, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap
      ${active === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
  >
    {icon} {label}
  </button>
);

const KPICard = ({ title, value, icon, color, border, negative }) => (
  <div className={`p-6 rounded-3xl border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${border}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className={`text-3xl font-black tracking-tight ${negative ? 'text-rose-500' : 'text-slate-800'}`}>{value}</h3>
      </div>
      <div className={`p-3.5 rounded-2xl ${color} transition-transform group-hover:scale-110`}>{icon}</div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-slate-100 text-sm">
        <p className="font-bold text-slate-800 mb-1">{label || payload[0].name}</p>
        <p className="text-indigo-600 font-semibold">
          {payload[0].value.toLocaleString()} {payload[0].name === 'Tasa Cancelación' ? '%' : ''}
        </p>
      </div>
    );
  }
  return null;
};

const LoadingState = () => (
  <div className="flex h-96 items-center justify-center bg-slate-50 rounded-3xl border border-slate-100">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-slate-200"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-slate-500 font-bold animate-pulse">Procesando millones de datos...</p>
    </div>
  </div>
);

const ErrorState = ({ retry }) => (
  <div className="p-10 text-center bg-red-50 rounded-3xl border border-red-100">
    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle size={32} /></div>
    <h3 className="text-lg font-bold text-red-900 mb-2">Algo salió mal</h3>
    <p className="text-red-600 mb-6">No pudimos conectar con el servidor de análisis.</p>
    <button onClick={retry} className="px-6 py-2.5 bg-white text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-50 transition-colors shadow-sm">Intentar de nuevo</button>
  </div>
);

export default BIDashboard;